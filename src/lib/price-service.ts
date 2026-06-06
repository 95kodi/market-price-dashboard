import { promises as fs } from "fs";
import path from "path";
import { chromium } from "playwright";
import { getActiveUrls, savePriceRecord } from "./json-store";
import { scrapeAmazon } from "./scraper/amazon";
import { scrapeFlipkart } from "./scraper/flipkart";
import { scrapeCroma } from "./scraper/croma";
import { scrapeReliance } from "./scraper/reliance";
import { scrapeVijaySales } from "./scraper/vijaysales";
import { scrapeChennaiMobiles } from "./scraper/chennaimobiles";
import { scrapePoorvika } from "./scraper/poorvika";

const logFile = path.join(process.cwd(), "logs", "scraper.log");

async function writeToLog(message: string) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  try {
    await fs.mkdir(path.dirname(logFile), { recursive: true });
    await fs.appendFile(logFile, logMessage, "utf-8");
  } catch (err) {
    console.error("Failed to write to scraper.log:", err);
  }
}

export function detectStoreName(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes("amazon.in") || lower.includes("amazon.com")) {
    return "Amazon";
  }
  if (lower.includes("flipkart.com")) {
    return "Flipkart";
  }
  if (lower.includes("croma.com")) {
    return "Croma";
  }
  if (lower.includes("reliancedigital.in")) {
    return "Reliance Digital";
  }
  if (lower.includes("vijaysales.com")) {
    return "Vijay Sales";
  }
  if (lower.includes("thechennaimobiles.com") || lower.includes("chennaimobiles.com")) {
    return "Chennai Mobiles";
  }
  if (lower.includes("poorvika.com")) {
    return "Poorvika";
  }
  return "Unknown";
}

async function scrapeUrl(page: any, storeName: string, url: string): Promise<number> {
  const store = storeName.toLowerCase();
  if (store.includes("amazon")) return scrapeAmazon(page, url);
  if (store.includes("flipkart")) return scrapeFlipkart(page, url);
  if (store.includes("croma")) return scrapeCroma(page, url);
  if (store.includes("reliance")) return scrapeReliance(page, url);
  if (store.includes("vijay")) return scrapeVijaySales(page, url);
  if (store.includes("chennai")) return scrapeChennaiMobiles(page, url);
  if (store.includes("poorvika")) return scrapePoorvika(page, url);
  throw new Error(`Unsupported store: ${storeName}`);
}

export async function runPriceScan() {
  await writeToLog("INFO: Starting price scan...");
  
  let activeUrls;
  try {
    activeUrls = await getActiveUrls();
  } catch (err: any) {
    await writeToLog(`ERROR: Failed to read active URLs: ${err.message || err}`);
    return { success: false, products_scanned: 0, prices_found: 0, errors: 0 };
  }

  if (activeUrls.length === 0) {
    await writeToLog("INFO: No active URLs to scan.");
    return { success: true, products_scanned: 0, prices_found: 0, errors: 0 };
  }

  await writeToLog(`INFO: Found ${activeUrls.length} active URLs to scan.`);

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
  } catch (err: any) {
    await writeToLog(`ERROR: Failed to launch Playwright browser: ${err.message || err}`);
    return { success: false, products_scanned: 0, prices_found: 0, errors: activeUrls.length };
  }

  let pricesFound = 0;
  let errorsCount = 0;
  const scannedProductIds = new Set<number>();

  const timestamp = new Date().toISOString();

  // Concurrency limit of 3 workers
  const concurrencyLimit = 3;
  const queue = [...activeUrls];
  
  const workers = Array.from({ length: concurrencyLimit }, async (_, i) => {
    let context;
    try {
      context = await browser.newContext({
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        viewport: { width: 1280, height: 800 }
      });
    } catch (err: any) {
      await writeToLog(`ERROR: Worker ${i} failed to create context: ${err.message || err}`);
      return;
    }

    let page;
    try {
      page = await context.newPage();
    } catch (err: any) {
      await writeToLog(`ERROR: Worker ${i} failed to create new page: ${err.message || err}`);
      await context.close();
      return;
    }

    while (queue.length > 0) {
      const urlRecord = queue.shift();
      if (!urlRecord) break;

      const { product_id, product_url, store_name: dbStoreName } = urlRecord;
      scannedProductIds.add(product_id);
      
      const detected = detectStoreName(product_url);
      const storeName = detected !== "Unknown" ? detected : (dbStoreName || "Unknown");

      let price = 0;
      let success = false;
      let lastError: any = null;

      // Retry up to 3 times (4 attempts total)
      for (let attempt = 1; attempt <= 4; attempt++) {
        try {
          price = await scrapeUrl(page, storeName, product_url);
          success = true;
          break;
        } catch (err: any) {
          lastError = err;
          if (attempt < 4) {
            // Wait 1 second before next attempt
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      }

      if (success) {
        pricesFound++;
        try {
          await savePriceRecord(product_id, storeName, price, timestamp);
          await writeToLog(`SUCCESS: Scanned ${product_url} (${storeName}) - Price: ${price}`);
        } catch (err: any) {
          errorsCount++;
          await writeToLog(`ERROR: Failed to save record for product ${product_id} from ${storeName}: ${err.message || err}`);
        }
      } else {
        errorsCount++;
        const errMsg = lastError?.message || String(lastError);
        await writeToLog(`ERROR: Failed to scan ${product_url} (${storeName}) after 3 retries. Error: ${errMsg}`);
      }
    }

    try {
      await page.close();
      await context.close();
    } catch {}
  });

  await Promise.all(workers);
  
  try {
    await browser.close();
  } catch {}

  const summary = {
    success: errorsCount === 0,
    products_scanned: scannedProductIds.size,
    prices_found: pricesFound,
    errors: errorsCount
  };

  await writeToLog(`INFO: Scan completed. Summary: ${JSON.stringify(summary)}`);
  
  return summary;
}
