"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/components/products/ProductForm";
import { ProductUrlsTable } from "@/components/products/ProductUrlsTable";
import { Toast } from "@/components/ui/toast";
import { UrlModal } from "@/components/products/UrlModal";
import type { AdminProduct, AdminProductUrl, AdminProductInput, AdminProductUrlInput } from "@/types/product-management";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const productId = Number(unwrappedParams.id);
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [urls, setUrls] = useState<AdminProductUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [urlSaving, setUrlSaving] = useState(false);
  const [urlError, setUrlError] = useState<string | undefined>();
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUrl, setEditingUrl] = useState<AdminProductUrl | undefined>(undefined);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [productResponse, urlsResponse] = await Promise.all([
          fetch(`/api/products/${productId}`, { cache: "no-store" }),
          fetch(`/api/products/${productId}/urls`, { cache: "no-store" })
        ]);

        if (!productResponse.ok) {
          throw new Error("Product not found");
        }

        const productPayload = await productResponse.json();
        setProduct(productPayload);

        if (urlsResponse.ok) {
          const urlsPayload = await urlsResponse.json();
          setUrls(urlsPayload);
        }
      } catch {
        setToast({ message: "Unable to load product details.", variant: "error" });
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [productId]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const refreshUrls = async () => {
    const response = await fetch(`/api/products/${productId}/urls`, { cache: "no-store" });
    if (!response.ok) return;
    const payload = await response.json();
    setUrls(payload);
  };

  const handleSubmit = async (values: AdminProductInput) => {
    if (loading || !product) return;
    setSaving(true);
    const response = await fetch(`/api/products/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    const result = await response.json();
    if (!response.ok) {
      setToast({ message: result?.error ?? "Unable to save product.", variant: "error" });
      setSaving(false);
      return;
    }

    setProduct(result);
    setToast({ message: "Product updated successfully.", variant: "success" });
    setSaving(false);
  };

  const handleAddUrl = () => {
    setEditingUrl(undefined);
    setUrlError(undefined);
    setModalOpen(true);
  };

  const handleEditUrl = (url: AdminProductUrl) => {
    setEditingUrl(url);
    setUrlError(undefined);
    setModalOpen(true);
  };

  const handleDeleteUrl = async (url: AdminProductUrl) => {
    const confirmed = window.confirm(`Delete URL for ${url.store_name}?`);
    if (!confirmed) return;

    const response = await fetch(`/api/product-urls/${url.id}`, { method: "DELETE" });
    if (!response.ok) {
      setToast({ message: "Unable to delete URL.", variant: "error" });
      return;
    }

    setToast({ message: "URL deleted successfully.", variant: "success" });
    await refreshUrls();
  };

  const handleSaveUrl = async (payload: AdminProductUrlInput) => {
    setUrlSaving(true);
    setUrlError(undefined);

    const response = await fetch(editingUrl ? `/api/product-urls/${editingUrl.id}` : `/api/products/${productId}/urls`, {
      method: editingUrl ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingUrl ? { product_url: payload.product_url, active: payload.active } : payload)
    });

    const result = await response.json();
    if (!response.ok) {
      setUrlError(result?.error ?? "Unable to save URL.");
      setUrlSaving(false);
      return;
    }

    setToast({ message: editingUrl ? "URL updated successfully." : "URL created successfully.", variant: "success" });
    setUrlSaving(false);
    setModalOpen(false);
    await refreshUrls();
  };

  if (loading) {
    return <p className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-700 shadow-sm">Loading product details…</p>;
  }

  if (!product) {
    return <p className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">Product not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Edit Product</p>
            <h1 className="text-2xl font-semibold text-slate-950">{product.name}</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => router.push("/products")}>Back to products</Button>
            <Button variant="default" onClick={handleAddUrl}>Add URL</Button>
          </div>
        </div>
      </div>

      <ProductForm
        initialData={{
          name: product.name,
          category: product.category ?? "",
          brand: product.brand ?? "",
          description: product.description ?? "",
          active: product.active
        }}
        submitLabel="Update product"
        isSaving={saving}
        onSubmit={handleSubmit}
      />

      <div className="space-y-4">
        <ProductUrlsTable urls={urls} onEdit={handleEditUrl} onDelete={handleDeleteUrl} />
      </div>

      <UrlModal
        open={modalOpen}
        initialValue={editingUrl}
        saving={urlSaving}
        error={urlError}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveUrl}
      />

      {toast && <Toast visible message={toast.message} variant={toast.variant} />}
    </div>
  );
}
