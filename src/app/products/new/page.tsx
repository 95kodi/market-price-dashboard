"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/components/products/ProductForm";
import { Toast } from "@/components/ui/toast";
import type { AdminProductInput } from "@/types/product-management";

export default function CreateProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);
  const [serverError, setServerError] = useState<string | undefined>();

  const handleSubmit = async (payload: AdminProductInput) => {
    setSaving(true);
    setServerError(undefined);

    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok) {
      setServerError(result?.error ?? "Unable to save product.");
      setToast({ message: "Failed to create product.", variant: "error" });
      setSaving(false);
      return;
    }

    setToast({ message: "Product created successfully.", variant: "success" });
    setSaving(false);
    setTimeout(() => router.push("/products"), 700);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">New Product</p>
            <h1 className="text-2xl font-semibold text-slate-950">Add a new product</h1>
          </div>
          <Button variant="outline" onClick={() => router.push("/products")}>
            Back to products
          </Button>
        </div>
      </div>
      <ProductForm
        submitLabel="Save product"
        isSaving={saving}
        onSubmit={handleSubmit}
        serverError={serverError}
      />
      {toast && <Toast visible message={toast.message} variant={toast.variant} />}
    </div>
  );
}
