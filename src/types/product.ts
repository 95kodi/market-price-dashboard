export type ProductStatus = "Winning" | "Losing" | "Equal";

export type Competitor =
  | "Poorvika"
  | "Croma"
  | "Reliance Digital"
  | "Vijay Sales"
  | "Chennai Mobiles";

export type Product = {
  id: number;
  product: string;
  brand: string;
  ourPrice: number;
  competitorPrices: Record<Competitor, number>;
  updatedAt: string;
  updatedAtMinutes: number;
};
