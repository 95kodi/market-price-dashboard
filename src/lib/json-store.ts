import { promises as fs } from "fs";
import path from "path";
import type { AdminProductUrl } from "@/types/product-management";

const dataDir = path.join(process.cwd(), "data");
const productsFile = path.join(dataDir, "products.json");
const urlsFile = path.join(dataDir, "product-urls.json");
const historyFile = path.join(dataDir, "price-history.json");
const latestFile = path.join(dataDir, "latest-prices.json");

export type PriceHistoryRecord = {
  product_id: number;
  store_name: string;
  price: number;
  scraped_at: string;
};

export type LatestPriceRecord = {
  product_id: number;
  store_name: string;
  price: number;
  last_updated: string;
};

async function readJson<T>(file: string): Promise<T[]> {
  try {
    const text = await fs.readFile(file, "utf-8");
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed as T[];
    return [] as T[];
  } catch (err: any) {
    if (err.code === "ENOENT") {
      await fs.mkdir(dataDir, { recursive: true });
      await fs.writeFile(file, "[]", "utf-8");
      return [] as T[];
    }
    throw err;
  }
}

async function writeJson<T>(file: string, data: T[]) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf-8");
}

export async function getLatestPrices(): Promise<LatestPriceRecord[]> {
  return readJson<LatestPriceRecord>(latestFile);
}

export async function getPriceHistory(): Promise<PriceHistoryRecord[]> {
  return readJson<PriceHistoryRecord>(historyFile);
}

export async function savePriceRecord(
  productId: number,
  storeName: string,
  price: number,
  timestamp: string
): Promise<void> {
  // 1. Append to price-history.json
  const history = await getPriceHistory();
  const historyRecord: PriceHistoryRecord = {
    product_id: productId,
    store_name: storeName,
    price,
    scraped_at: timestamp,
  };
  history.push(historyRecord);
  await writeJson(historyFile, history);

  // 2. Update or insert in latest-prices.json
  const latest = await getLatestPrices();
  const existingIndex = latest.findIndex(
    (item) => item.product_id === productId && item.store_name.toLowerCase() === storeName.toLowerCase()
  );

  const latestRecord: LatestPriceRecord = {
    product_id: productId,
    store_name: storeName,
    price,
    last_updated: timestamp,
  };

  if (existingIndex > -1) {
    latest[existingIndex] = latestRecord;
  } else {
    latest.push(latestRecord);
  }
  await writeJson(latestFile, latest);
}

export async function getActiveUrls(): Promise<AdminProductUrl[]> {
  const urls = await readJson<AdminProductUrl>(urlsFile);
  return urls.filter((u) => u.active);
}

