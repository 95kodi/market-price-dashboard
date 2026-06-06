export type AdminProduct = {
  id: number;
  name: string;
  category: string | null;
  brand: string | null;
  our_price?: number | null;
  description: string | null;
  active: boolean;
  created_at: string;
  url_count?: number;
};

export type AdminProductInput = {
  name: string;
  category?: string;
  brand?: string;
  our_price?: number | null;
  description?: string;
  active: boolean;
};

export type AdminProductUrl = {
  id: number;
  product_id: number;
  store_name: string;
  product_url: string;
  active: boolean;
  created_at: string;
};

export type AdminProductUrlInput = {
  store_name: string;
  product_url: string;
  active: boolean;
};
