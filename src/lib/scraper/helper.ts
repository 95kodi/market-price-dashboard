import { Page } from "playwright";

/**
 * Attemps to find price inside Schema.org JSON-LD scripts.
 */
export async function scrapeJsonLdPrice(page: Page): Promise<number | null> {
  try {
    const jsonLdPrices = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      const prices: number[] = [];
      for (const script of scripts) {
        try {
          const text = script.textContent || "";
          if (!text.trim()) continue;
          const data = JSON.parse(text);
          const objects = Array.isArray(data) ? data : [data];
          for (const obj of objects) {
            // Check for Product or Offer type
            if (obj && (obj["@type"] === "Product" || obj["@type"] === "http://schema.org/Product" || obj["@type"] === "https://schema.org/Product")) {
              if (obj.offers) {
                const offers = Array.isArray(obj.offers) ? obj.offers : [obj.offers];
                for (const offer of offers) {
                  if (offer && offer.price !== undefined && offer.price !== null) {
                    const p = parseFloat(String(offer.price).replace(/[^0-9.]/g, ""));
                    if (!isNaN(p) && p > 0) prices.push(p);
                  }
                }
              }
            } else if (obj && (obj["@type"] === "Offer" || obj["@type"] === "http://schema.org/Offer" || obj["@type"] === "https://schema.org/Offer")) {
              if (obj.price !== undefined && obj.price !== null) {
                const p = parseFloat(String(obj.price).replace(/[^0-9.]/g, ""));
                if (!isNaN(p) && p > 0) prices.push(p);
              }
            }
          }
        } catch {}
      }
      return prices;
    });
    if (jsonLdPrices && jsonLdPrices.length > 0) {
      return jsonLdPrices[0];
    }
  } catch {}
  return null;
}

/**
 * Attempts to find price using a list of CSS selectors.
 */
export async function scrapeSelectorsPrice(page: Page, selectors: string[]): Promise<number | null> {
  // Wait up to 8 seconds for any selector to become visible
  try {
    const combinedSelector = selectors.join(", ");
    await page.waitForSelector(combinedSelector, { state: "visible", timeout: 8000 });
  } catch {}

  for (const selector of selectors) {
    try {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 500 })) {
        const text = await element.textContent();
        if (text) {
          const priceVal = parseFloat(text.replace(/[^0-9.]/g, ""));
          if (!isNaN(priceVal) && priceVal > 0) {
            return priceVal;
          }
        }
      }
    } catch {}
  }
  return null;
}

/**
 * Fallback to look for generic price selectors.
 */
export async function scrapeFallbackPrice(page: Page): Promise<number | null> {
  const genericSelectors = [
    "[itemprop='price']",
    "[itemtype*='Offer'] [itemprop='price']",
    "span[class*='price']",
    "div[class*='price']",
    "span[id*='price']",
    "div[id*='price']",
    ".price",
    ".amount",
    "#price",
    ".product-price",
    ".current-price"
  ];
  return scrapeSelectorsPrice(page, genericSelectors);
}
