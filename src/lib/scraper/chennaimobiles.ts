import { Page } from "playwright";
import { scrapeJsonLdPrice, scrapeSelectorsPrice, scrapeFallbackPrice } from "./helper";

export async function scrapeChennaiMobiles(page: Page, url: string): Promise<number> {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

  // 1. Try JSON-LD
  const jsonLdPrice = await scrapeJsonLdPrice(page);
  if (jsonLdPrice !== null) return jsonLdPrice;

  // 2. Try selectors
  const selectors = [
    ".price-box .price",
    "span.price",
    ".price",
    ".product-price",
    ".current-price"
  ];
  const selectorPrice = await scrapeSelectorsPrice(page, selectors);
  if (selectorPrice !== null) return selectorPrice;

  // 3. Try fallback generic selectors
  const fallbackPrice = await scrapeFallbackPrice(page);
  if (fallbackPrice !== null) return fallbackPrice;

  throw new Error("Could not extract price from Chennai Mobiles product page");
}
