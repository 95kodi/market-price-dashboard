"use client";

import { RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PriceMatrixStatus } from "@/lib/price-intelligence";

type FiltersProps = {
  search: string;
  brand: string;
  status: string;
  brands: string[];
  onSearchChange: (value: string) => void;
  onBrandChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onRefresh: () => void;
};

const statuses: PriceMatrixStatus[] = ["Winning", "Losing", "Equal", "N/A"];

export function Filters({
  search,
  brand,
  status,
  brands,
  onSearchChange,
  onBrandChange,
  onStatusChange,
  onRefresh
}: FiltersProps) {
  return (
    <Card>
      <CardContent className="grid gap-3 p-4 md:grid-cols-[minmax(260px,1.4fr)_repeat(2,minmax(160px,1fr))_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search product"
            className="pl-9"
          />
        </div>
        <Select value={brand} onValueChange={onBrandChange}>
          <SelectTrigger>
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Brands</SelectItem>
            {brands.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            {statuses.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={onRefresh} className="justify-center">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </CardContent>
    </Card>
  );
}
