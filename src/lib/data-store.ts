import { promises as fs } from "fs";
import path from "path";
import type { AdminProduct, AdminProductInput, AdminProductUrl, AdminProductUrlInput } from "@/types/product-management";

const dataDir = path.join(process.cwd(), "data");
const productsFile = path.join(dataDir, "products.json");
const urlsFile = path.join(dataDir, "product-urls.json");

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

export async function getProducts(options?: { search?: string; limit?: number; offset?: number }) {
  const products = await readJson<AdminProduct>(productsFile);
  const urls = await readJson<AdminProductUrl>(urlsFile);

  let items = products;
  if (options?.search) {
    const q = options.search.trim().toLowerCase();
    items = items.filter((p) => p.name.toLowerCase().includes(q));
  }

  const total = items.length;
  const offset = options?.offset ?? 0;
  const limit = options?.limit ?? 10;
  const paged = items.slice(offset, offset + limit);

  const itemsWithCount = paged.map((p) => ({
    ...p,
    url_count: urls.filter((u) => u.product_id === p.id).length
  }));

  return { items: itemsWithCount, total };
}

export async function getProductById(id: number) {
  const products = await readJson<AdminProduct>(productsFile);
  return products.find((p) => p.id === id) ?? null;
}

export async function createProduct(data: AdminProductInput) {
  const products = await readJson<AdminProduct>(productsFile);
  const nextId = products.reduce((max, p) => Math.max(max, p.id), 0) + 1;
  const created_at = new Date().toISOString();
  const product: AdminProduct = {
    id: nextId,
    name: data.name,
    category: data.category ?? null,
    brand: data.brand ?? null,
    our_price: data.our_price ?? null,
    description: data.description ?? null,
    active: data.active ?? true,
    created_at
  };
  products.unshift(product);
  await writeJson(productsFile, products);
  return product;
}

export async function updateProduct(id: number, data: AdminProductInput) {
  const products = await readJson<AdminProduct>(productsFile);
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  products[idx] = {
    ...products[idx],
    name: data.name,
    category: data.category ?? null,
    brand: data.brand ?? null,
    our_price: data.our_price ?? products[idx].our_price ?? null,
    description: data.description ?? null,
    active: data.active ?? products[idx].active
  };
  await writeJson(productsFile, products);
  return products[idx];
}

export async function deleteProduct(id: number) {
  const products = await readJson<AdminProduct>(productsFile);
  const urls = await readJson<AdminProductUrl>(urlsFile);
  const filtered = products.filter((p) => p.id !== id);
  const filteredUrls = urls.filter((u) => u.product_id !== id);
  await writeJson(productsFile, filtered);
  await writeJson(urlsFile, filteredUrls);
  return true;
}

export async function getProductUrls(productId: number) {
  const urls = await readJson<AdminProductUrl>(urlsFile);
  return urls.filter((u) => u.product_id === productId);
}

export async function createProductUrl(productId: number, data: AdminProductUrlInput) {
  const products = await readJson<AdminProduct>(productsFile);
  const urls = await readJson<AdminProductUrl>(urlsFile);
  const productExists = products.some((p) => p.id === productId);
  if (!productExists) throw new Error("Product not found.");

  // Prevent duplicate store_name for same product
  const duplicate = urls.find((u) => u.product_id === productId && u.store_name.toLowerCase() === data.store_name.trim().toLowerCase());
  if (duplicate) {
    throw new Error("A URL for this store already exists for the product.");
  }

  const nextId = urls.reduce((max, u) => Math.max(max, u.id), 0) + 1;
  const created_at = new Date().toISOString();
  const urlRecord: AdminProductUrl = {
    id: nextId,
    product_id: productId,
    store_name: data.store_name.trim(),
    product_url: data.product_url.trim(),
    active: data.active ?? true,
    created_at
  };

  urls.unshift(urlRecord);
  await writeJson(urlsFile, urls);
  return urlRecord;
}

export async function updateProductUrl(id: number, data: { product_url: string; active: boolean }) {
  const urls = await readJson<AdminProductUrl>(urlsFile);
  const idx = urls.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  urls[idx] = {
    ...urls[idx],
    product_url: data.product_url,
    active: data.active
  };
  await writeJson(urlsFile, urls);
  return urls[idx];
}

export async function deleteProductUrl(id: number) {
  const urls = await readJson<AdminProductUrl>(urlsFile);
  const filtered = urls.filter((u) => u.id !== id);
  await writeJson(urlsFile, filtered);
  return true;
}
