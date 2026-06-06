"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductsTable } from "@/components/products/ProductsTable";
import { Toast } from "@/components/ui/toast";
import type { AdminProduct } from "@/types/product-management";

export default function ProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  async function loadProducts(signal?: AbortSignal) {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/products?search=${encodeURIComponent(search)}&page=${page}&pageSize=${pageSize}`,
        { cache: "no-store", signal }
      );
      if (!response.ok) {
        throw new Error("Unable to load products.");
      }
      const payload = await response.json();
      setProducts(payload.items);
      setTotal(payload.total);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setToast({ message: "Could not load products. Please try again.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    void loadProducts(controller.signal);
    return () => controller.abort();
  }, [search, page, pageSize]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleDelete = async (product: AdminProduct) => {
    const confirmed = window.confirm(`Delete product ${product.name}?`);
    if (!confirmed) return;

    const response = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
    if (!response.ok) {
      setToast({ message: "Unable to delete product.", variant: "error" });
      return;
    }
    setToast({ message: "Product deleted successfully.", variant: "success" });
    void loadProducts();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Products</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-950">Manage catalog entries</h2>
          <p className="mt-1 text-sm text-slate-600">Search, edit, and remove products with fast URL count visibility.</p>
        </div>
        <Link href="/products/new">
          <Button>Add Product</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => { setSearch(event.target.value); setPage(1); }}
            placeholder="Search by product name"
            className="pl-10"
            disabled={loading}
          />
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => void loadProducts()} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      <ProductsTable
        products={products}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onDelete={handleDelete}
      />

      {toast && <Toast message={toast.message} variant={toast.variant} visible={Boolean(toast)} />}
    </div>
  );
}
