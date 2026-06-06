import type { Metadata } from "next";
import { ReactNode } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Products | Admin Dashboard",
  description: "Manage products, URLs, and inventory for the admin dashboard."
};

export default function ProductsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b bg-white/95 px-4 py-4 shadow-sm sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-700">Admin</p>
            <h1 className="text-2xl font-semibold tracking-tight">Product Management</h1>
          </div>
          <Link href="/products" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Products Home
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
