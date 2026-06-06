"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminProductUrl, AdminProductUrlInput } from "@/types/product-management";

type UrlModalProps = {
  open: boolean;
  initialValue?: AdminProductUrl;
  saving?: boolean;
  error?: string;
  onClose: () => void;
  onSave: (payload: AdminProductUrlInput) => Promise<void>;
};

export function UrlModal({ open, initialValue, saving = false, error, onClose, onSave }: UrlModalProps) {
  const [storeName, setStoreName] = useState(initialValue?.store_name ?? "");
  const [productUrl, setProductUrl] = useState(initialValue?.product_url ?? "");
  const [active, setActive] = useState(initialValue?.active ?? true);

  useEffect(() => {
    setStoreName(initialValue?.store_name ?? "");
    setProductUrl(initialValue?.product_url ?? "");
    setActive(initialValue?.active ?? true);
  }, [initialValue, open]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSave({ store_name: storeName.trim(), product_url: productUrl.trim(), active });
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">{initialValue ? "Edit URL" : "Add URL"}</h2>
            <p className="text-sm text-slate-600">Store name and URL are required to save.</p>
          </div>
          <button type="button" className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="store-name" className="block text-sm font-medium text-slate-700">
              Store Name
            </label>
            <Input
              id="store-name"
              value={storeName}
              onChange={(event) => setStoreName(event.target.value)}
              placeholder="Example: Amazon"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="product-url" className="block text-sm font-medium text-slate-700">
              Product URL
            </label>
            <Input
              id="product-url"
              value={productUrl}
              onChange={(event) => setProductUrl(event.target.value)}
              placeholder="https://"
              required
            />
          </div>

          <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={active}
              onChange={(event) => setActive(event.target.checked)}
              className="h-4 w-4 rounded border border-input text-slate-900 focus:ring-slate-900"
            />
            Active
          </label>

          {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save URL"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
