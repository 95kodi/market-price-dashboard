"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminProduct, AdminProductInput } from "@/types/product-management";

type ProductFormProps = {
  initialData?: AdminProductInput;
  onSubmit: (values: AdminProductInput) => Promise<void> | void;
  isSaving?: boolean;
  submitLabel: string;
  serverError?: string;
};

export function ProductForm({ initialData, onSubmit, isSaving = false, submitLabel, serverError }: ProductFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [category, setCategory] = useState(initialData?.category ?? "");
  const [brand, setBrand] = useState(initialData?.brand ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [active, setActive] = useState(initialData?.active ?? true);
  const [errors, setErrors] = useState<string[]>([]);

  const formErrors = useMemo(() => {
    const list: string[] = [];
    if (!name.trim()) list.push("Product name is required.");
    return list;
  }, [name]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors([]);

    if (!name.trim()) {
      setErrors(["Product name is required."]);
      return;
    }

    await onSubmit({
      name: name.trim(),
      category: category.trim() || undefined,
      brand: brand.trim() || undefined,
      description: description.trim() || undefined,
      active
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <label htmlFor="product-name" className="block text-sm font-medium text-slate-700">
          Product Name
        </label>
        <Input
          id="product-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Enter product name"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="category" className="block text-sm font-medium text-slate-700">
            Category
          </label>
          <Input id="category" value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Category" />
        </div>
        <div className="space-y-2">
          <label htmlFor="brand" className="block text-sm font-medium text-slate-700">
            Brand
          </label>
          <Input id="brand" value={brand} onChange={(event) => setBrand(event.target.value)} placeholder="Brand" />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={4}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Brief description"
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

      {(errors.length > 0 || serverError) && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {errors.map((message) => (
            <p key={message}>{message}</p>
          ))}
          {serverError && <p>{serverError}</p>}
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
