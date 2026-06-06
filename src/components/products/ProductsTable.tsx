"use client";

import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AdminProduct } from "@/types/product-management";

type ProductsTableProps = {
  products: AdminProduct[];
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onDelete: (product: AdminProduct) => void;
};

const statusVariants: Record<"true" | "false", string> = {
  true: "bg-emerald-100 text-emerald-800",
  false: "bg-slate-100 text-slate-700"
};

export function ProductsTable({ products, page, pageSize, total, onPageChange, onPageSizeChange, onDelete }: ProductsTableProps) {
  const pageCount = Math.max(Math.ceil(total / pageSize), 1);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 border-b bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Products</CardTitle>
          <p className="text-sm text-muted-foreground">Manage active products, categories, and URL assignments.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600">{total} products</span>
          <Link href="/products/new">
            <Button variant="default">Add Product</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>URLs</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.id}</TableCell>
                    <TableCell>
                      <div className="max-w-[240px] truncate font-medium text-slate-900">{product.name}</div>
                    </TableCell>
                    <TableCell>{product.category || "—"}</TableCell>
                    <TableCell>{product.brand || "—"}</TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusVariants[String(product.active) as "true" | "false"]}`}>
                        {product.active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>{product.url_count ?? 0}</TableCell>
                    <TableCell className="flex flex-wrap gap-2">
                      <Link href={`/products/${product.id}`}>
                        <Button variant="outline" size="icon" aria-label="Edit product">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-rose-200 text-rose-600 hover:bg-rose-50"
                        onClick={() => onDelete(product)}
                        aria-label="Delete product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col gap-3 border-t bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {pageCount}
          </p>
          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size} rows
                </option>
              ))}
            </select>
            <Button variant="outline" onClick={() => onPageChange(Math.max(page - 1, 1))} disabled={page === 1}>
              Previous
            </Button>
            <Button variant="outline" onClick={() => onPageChange(Math.min(page + 1, pageCount))} disabled={page === pageCount}>
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
