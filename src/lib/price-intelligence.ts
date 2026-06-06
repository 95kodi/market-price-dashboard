import type { LatestPriceRecord } from "@/lib/json-store";
import type { Competitor, Product, ProductStatus } from "@/types/product";
import type { AdminProduct } from "@/types/product-management";

export function getMarketPrices(product: Product, competitors: readonly Competitor[]) {
  return [product.ourPrice, ...competitors.map((competitor) => product.competitorPrices[competitor])];
}

export function getLowestPrice(product: Product, competitors: readonly Competitor[]) {
  return Math.min(...getMarketPrices(product, competitors));
}

export function getHighestPrice(product: Product, competitors: readonly Competitor[]) {
  return Math.max(...getMarketPrices(product, competitors));
}

export function getPriceGap(product: Product, competitors: readonly Competitor[]) {
  return product.ourPrice - getLowestPrice(product, competitors);
}

export function getProductStatus(product: Product, competitors: readonly Competitor[]): ProductStatus {
  const lowestPrice = getLowestPrice(product, competitors);
  const competitorLowest = Math.min(...competitors.map((competitor) => product.competitorPrices[competitor]));

  if (product.ourPrice < competitorLowest) {
    return "Winning";
  }

  if (product.ourPrice === lowestPrice) {
    return "Equal";
  }

  return "Losing";
}

export type PriceMatrixStatus = ProductStatus | "N/A";

export type PriceMatrixRow = {
  id: string;
  productId: number;
  productName: string;
  brand: string;
  ourPrice: number | null;
  competitorPrices: Record<string, number>;
  lowestCompetitorPrice: number | null;
  highestCompetitorPrice: number | null;
  priceGap: number | null;
  status: PriceMatrixStatus;
  lastUpdated: string;
};

type ProductWithOptionalPrice = AdminProduct & {
  our_price?: number | null;
  ourPrice?: number | null;
  current_price?: number | null;
  currentPrice?: number | null;
  price?: number | null;
};

const OUR_PRICE_STORES = new Set(["our price", "our store", "ourprice"]);

function normalizeStoreName(storeName: string) {
  return storeName.trim().replace(/\s+/g, " ");
}

function normalizeStoreKey(storeName: string) {
  return normalizeStoreName(storeName).toLowerCase();
}

function getProductOurPrice(product: ProductWithOptionalPrice) {
  return product.our_price ?? product.ourPrice ?? product.current_price ?? product.currentPrice ?? product.price ?? null;
}

export function getCompetitorColumns(rows: PriceMatrixRow[]) {
  return Array.from(new Set(rows.flatMap((row) => Object.keys(row.competitorPrices)))).sort((a, b) =>
    a.localeCompare(b)
  );
}

export function getMatrixStatus(ourPrice: number | null, lowestCompetitorPrice: number | null): PriceMatrixStatus {
  if (ourPrice === null || lowestCompetitorPrice === null) {
    return "N/A";
  }

  if (ourPrice < lowestCompetitorPrice) {
    return "Winning";
  }

  if (ourPrice > lowestCompetitorPrice) {
    return "Losing";
  }

  return "Equal";
}

export function buildPriceComparisonMatrix(
  products: ProductWithOptionalPrice[],
  latestPrices: LatestPriceRecord[]
): PriceMatrixRow[] {
  const productsById = new Map(products.map((product) => [product.id, product]));
  const pricesByProduct = latestPrices.reduce<Map<number, LatestPriceRecord[]>>((grouped, price) => {
    const productPrices = grouped.get(price.product_id) ?? [];
    productPrices.push(price);
    grouped.set(price.product_id, productPrices);
    return grouped;
  }, new Map());

  return products
    .map((product) => {
      const productPrices = pricesByProduct.get(product.id) ?? [];
      const latestOurPriceRecord = productPrices.find((price) => OUR_PRICE_STORES.has(normalizeStoreKey(price.store_name)));
      const ourPrice = getProductOurPrice(product) ?? latestOurPriceRecord?.price ?? null;
      const competitorPrices: Record<string, number> = {};
      let lastUpdated = product.created_at;

      for (const price of productPrices) {
        if (OUR_PRICE_STORES.has(normalizeStoreKey(price.store_name))) {
          continue;
        }

        const storeName = normalizeStoreName(price.store_name);
        competitorPrices[storeName] = price.price;

        if (!lastUpdated || new Date(price.last_updated).getTime() > new Date(lastUpdated).getTime()) {
          lastUpdated = price.last_updated;
        }
      }

      const competitorValues = Object.values(competitorPrices);
      const lowestCompetitorPrice = competitorValues.length > 0 ? Math.min(...competitorValues) : null;
      const highestCompetitorPrice = competitorValues.length > 0 ? Math.max(...competitorValues) : null;
      const priceGap = ourPrice !== null && lowestCompetitorPrice !== null ? ourPrice - lowestCompetitorPrice : null;
      const status = getMatrixStatus(ourPrice, lowestCompetitorPrice);

      return {
        id: String(product.id),
        productId: product.id,
        productName: product.name,
        brand: product.brand || "Unknown",
        ourPrice,
        competitorPrices,
        lowestCompetitorPrice,
        highestCompetitorPrice,
        priceGap,
        status,
        lastUpdated
      };
    })
    .filter((row) => productsById.has(row.productId));
}
