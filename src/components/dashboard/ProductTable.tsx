"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  type PaginationState,
  type SortingState,
  useReactTable
} from "@tanstack/react-table";
import { ArrowDownUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { PriceMatrixStatus } from "@/lib/price-intelligence";
import { formatCurrency } from "./formatters";

export type DashboardPriceRow = {
  id: string;
  productId: number;
  productName: string;
  brand: string;
  ourPrice: number | null;
  competitorPrices: Record<string, number>;
  lowestCompetitorPrice: number | null;
  highestCompetitorPrice: number | null;
  priceGap: number | null;
  status: PriceMatrixStatus;
  lastUpdated: string;
};

type ProductTableProps = {
  products: DashboardPriceRow[];
  competitorColumns: string[];
};

const statusVariant: Record<DashboardPriceRow["status"], "success" | "danger" | "info" | "neutral"> = {
  Winning: "success",
  Losing: "danger",
  Equal: "info",
  "N/A": "neutral"
};

function priceCellClass(
  price: number | null,
  lowestPrice: number | null,
  highestPrice: number | null,
  isOurPrice = false,
  status?: DashboardPriceRow["status"]
) {
  if (price === null) {
    return "border-slate-200 bg-slate-50 text-slate-400";
  }

  if (status === "Equal" && (isOurPrice || (lowestPrice !== null && price === lowestPrice))) {
    return "border-blue-200 bg-blue-50 text-blue-800";
  }

  if (isOurPrice && status === "Winning") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (!isOurPrice && lowestPrice !== null && price <= lowestPrice) {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if ((isOurPrice && status === "Losing") || (!isOurPrice && highestPrice !== null && price >= highestPrice)) {
    return "border-red-200 bg-red-50 text-red-800";
  }

  return "border-transparent text-slate-800";
}

function PricePill({ className, emptyLabel = "-", value }: { className: string; emptyLabel?: string; value: number | null }) {
  return (
    <span className={cn("inline-flex min-w-[92px] justify-end rounded-md border px-2 py-1 font-semibold", className)}>
      {value === null ? emptyLabel : formatCurrency(value)}
    </span>
  );
}

export function ProductTable({ products, competitorColumns }: ProductTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "lastUpdated", desc: true }]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 8 });

  const columns = useMemo<ColumnDef<DashboardPriceRow>[]>(
    () => {
      const dynamicCompetitorColumns: ColumnDef<DashboardPriceRow>[] = competitorColumns.map((storeName) => ({
        id: `competitor-${storeName}`,
        header: () => <span className="block text-right">{storeName}</span>,
        accessorFn: (row) => row.competitorPrices[storeName] ?? null,
        sortingFn: (a, b) => {
          const left = a.original.competitorPrices[storeName] ?? Number.POSITIVE_INFINITY;
          const right = b.original.competitorPrices[storeName] ?? Number.POSITIVE_INFINITY;
          return left - right;
        },
        cell: ({ row }) => {
          const item = row.original;
          const price = item.competitorPrices[storeName] ?? null;
          return (
            <div className="text-right">
              <PricePill
                value={price}
                className={priceCellClass(price, item.lowestCompetitorPrice, item.highestCompetitorPrice, false, item.status)}
              />
            </div>
          );
        }
      }));

      return [
        {
          accessorKey: "productName",
          header: "Product Name",
          cell: ({ row }) => <div className="min-w-[200px] font-medium text-slate-950">{row.original.productName}</div>
        },
        {
          accessorKey: "brand",
          header: "Brand",
          cell: ({ row }) => <span className="font-medium text-slate-600">{row.original.brand}</span>
        },
        {
          accessorKey: "ourPrice",
          header: () => <span className="block text-right">Our Price</span>,
          cell: ({ row }) => {
            const item = row.original;
            return (
              <div className="text-right">
                <PricePill
                  value={item.ourPrice}
                  emptyLabel="N/A"
                  className={priceCellClass(
                    item.ourPrice,
                    item.lowestCompetitorPrice,
                    item.highestCompetitorPrice,
                    true,
                    item.status
                  )}
                />
              </div>
            );
          }
        },
        ...dynamicCompetitorColumns,
        {
          accessorKey: "lowestCompetitorPrice",
          header: () => <span className="block text-right">Lowest Competitor</span>,
          cell: ({ row }) => {
            const lowest = row.original.lowestCompetitorPrice;
            return (
              <div className="text-right">
              <PricePill value={lowest} className="border-transparent text-slate-600" />
              </div>
            );
          }
        },
        {
          accessorKey: "highestCompetitorPrice",
          header: () => <span className="block text-right">Highest Competitor</span>,
          cell: ({ row }) => {
            const highest = row.original.highestCompetitorPrice;
            return (
              <div className="text-right">
              <PricePill value={highest} className="border-transparent text-slate-600" />
              </div>
            );
          }
        },
        {
          accessorKey: "priceGap",
          header: () => <span className="block text-right">Price Gap</span>,
          cell: ({ row }) => {
            const gap = row.original.priceGap;
            if (gap === null) {
              return <div className="text-right font-medium text-slate-400">-</div>;
            }
            if (gap === 0) {
              return <div className="text-right font-medium text-slate-500">0.00</div>;
            }
            const isNegative = gap < 0;
            return (
              <div className={cn("text-right font-semibold", isNegative ? "text-emerald-600" : "text-rose-600")}>
                {isNegative ? "" : "+"}
                {formatCurrency(gap)}
              </div>
            );
          }
        },
        {
          id: "status",
          header: "Status",
          accessorFn: (row) => row.status,
          cell: ({ row }) => {
            const status = row.original.status;
            return <Badge variant={statusVariant[status]}>{status}</Badge>;
          }
        },
        {
          accessorKey: "lastUpdated",
          header: () => <span className="block whitespace-nowrap">Last Updated</span>,
          cell: ({ row }) => {
            const rawDateStr = row.original.lastUpdated;
            if (!rawDateStr) return <span className="text-muted-foreground">Never</span>;
            try {
              const date = new Date(rawDateStr);
              return <span className="whitespace-nowrap text-muted-foreground">{date.toLocaleString("en-IN")}</span>;
            } catch {
              return <span className="whitespace-nowrap text-muted-foreground">{rawDateStr}</span>;
            }
          }
        }
      ];
    },
    [competitorColumns]
  );

  const table = useReactTable({
    data: products,
    columns,
    state: {
      sorting,
      pagination
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  const sortValue = sorting[0] ? `${sorting[0].id}:${sorting[0].desc ? "desc" : "asc"}` : "lastUpdated:desc";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col gap-3 border-b bg-white px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle>Product Price Comparison Table</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Price analysis and store status relative to lowest competitor offerings.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Badge variant="neutral">{products.length} products</Badge>
          <Select
            value={sortValue}
            onValueChange={(value) => {
              const [id, direction] = value.split(":");
              setSorting([{ id, desc: direction === "desc" }]);
              table.setPageIndex(0);
            }}
          >
            <SelectTrigger className="w-full sm:w-[220px]">
              <ArrowDownUp className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lastUpdated:desc">Last Scanned: Newest</SelectItem>
              <SelectItem value="lastUpdated:asc">Last Scanned: Oldest</SelectItem>
              <SelectItem value="priceGap:desc">Price Gap: Highest</SelectItem>
              <SelectItem value="priceGap:asc">Price Gap: Lowest</SelectItem>
              <SelectItem value="ourPrice:asc">Our Price: Lowest</SelectItem>
              <SelectItem value="ourPrice:desc">Our Price: Highest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[620px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-slate-50 shadow-[0_1px_0_0_hsl(var(--border))]">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-slate-50">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="h-11 whitespace-nowrap text-xs font-semibold uppercase text-slate-500">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="h-12 bg-white hover:bg-slate-50/80">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="whitespace-nowrap py-2 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={table.getVisibleFlatColumns().length} className="h-32 text-center text-muted-foreground">
                    No items match the selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col gap-3 border-t bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {Math.max(table.getPageCount(), 1)}
          </p>
          <div className="flex items-center gap-2">
            <Select
              value={String(table.getState().pagination.pageSize)}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="w-[116px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 8, 10, 20].map((pageSize) => (
                  <SelectItem key={pageSize} value={String(pageSize)}>
                    {pageSize} rows
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
