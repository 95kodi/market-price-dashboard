import type { Product } from "@/types/product";

export const competitors = [
  "Poorvika",
  "Croma",
  "Reliance Digital",
  "Vijay Sales",
  "Chennai Mobiles"
] as const;

export const products: Product[] = [
  {
    id: 1,
    product: "iPhone 15 128GB",
    brand: "Apple",
    ourPrice: 68999,
    competitorPrices: {
      Poorvika: 67999,
      Croma: 68499,
      "Reliance Digital": 68999,
      "Vijay Sales": 69499,
      "Chennai Mobiles": 68199
    },
    updatedAt: "5 min ago",
    updatedAtMinutes: 5
  },
  {
    id: 2,
    product: "Samsung S25",
    brand: "Samsung",
    ourPrice: 74999,
    competitorPrices: {
      Poorvika: 76999,
      Croma: 75999,
      "Reliance Digital": 76499,
      "Vijay Sales": 77499,
      "Chennai Mobiles": 75999
    },
    updatedAt: "10 min ago",
    updatedAtMinutes: 10
  },
  {
    id: 3,
    product: "Vivo V50",
    brand: "Vivo",
    ourPrice: 29999,
    competitorPrices: {
      Poorvika: 30499,
      Croma: 30999,
      "Reliance Digital": 29999,
      "Vijay Sales": 31499,
      "Chennai Mobiles": 29499
    },
    updatedAt: "12 min ago",
    updatedAtMinutes: 12
  },
  {
    id: 4,
    product: "OnePlus 13 256GB",
    brand: "OnePlus",
    ourPrice: 61999,
    competitorPrices: {
      Poorvika: 62999,
      Croma: 62499,
      "Reliance Digital": 61999,
      "Vijay Sales": 63999,
      "Chennai Mobiles": 62199
    },
    updatedAt: "18 min ago",
    updatedAtMinutes: 18
  },
  {
    id: 5,
    product: "Sony Bravia 55-inch 4K",
    brand: "Sony",
    ourPrice: 78990,
    competitorPrices: {
      Poorvika: 80990,
      Croma: 79990,
      "Reliance Digital": 80490,
      "Vijay Sales": 81990,
      "Chennai Mobiles": 81490
    },
    updatedAt: "22 min ago",
    updatedAtMinutes: 22
  },
  {
    id: 6,
    product: "LG 260L Frost Free Refrigerator",
    brand: "LG",
    ourPrice: 32990,
    competitorPrices: {
      Poorvika: 33490,
      Croma: 31990,
      "Reliance Digital": 32490,
      "Vijay Sales": 33990,
      "Chennai Mobiles": 32990
    },
    updatedAt: "31 min ago",
    updatedAtMinutes: 31
  },
  {
    id: 7,
    product: "Dell Inspiron 14",
    brand: "Dell",
    ourPrice: 56990,
    competitorPrices: {
      Poorvika: 57990,
      Croma: 57490,
      "Reliance Digital": 58990,
      "Vijay Sales": 58490,
      "Chennai Mobiles": 57290
    },
    updatedAt: "45 min ago",
    updatedAtMinutes: 45
  },
  {
    id: 8,
    product: "Samsung Galaxy Tab S9 FE",
    brand: "Samsung",
    ourPrice: 36999,
    competitorPrices: {
      Poorvika: 35999,
      Croma: 36499,
      "Reliance Digital": 36999,
      "Vijay Sales": 37499,
      "Chennai Mobiles": 36199
    },
    updatedAt: "1 hour ago",
    updatedAtMinutes: 60
  },
  {
    id: 9,
    product: "Apple Watch Series 10",
    brand: "Apple",
    ourPrice: 46900,
    competitorPrices: {
      Poorvika: 47400,
      Croma: 46900,
      "Reliance Digital": 47900,
      "Vijay Sales": 46900,
      "Chennai Mobiles": 48200
    },
    updatedAt: "1 hour ago",
    updatedAtMinutes: 65
  },
  {
    id: 10,
    product: "Whirlpool 7kg Washing Machine",
    brand: "Whirlpool",
    ourPrice: 21990,
    competitorPrices: {
      Poorvika: 22490,
      Croma: 22990,
      "Reliance Digital": 22290,
      "Vijay Sales": 23490,
      "Chennai Mobiles": 22990
    },
    updatedAt: "2 hours ago",
    updatedAtMinutes: 120
  }
];
