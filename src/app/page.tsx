"use client";

import { useMemo, useState, useEffect } from "react";
import { Radar, ShieldCheck, Play, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Filters } from "@/components/dashboard/Filters";
import { KPICards } from "@/components/dashboard/KPIcards";
import { ProductTable, type DashboardPriceRow } from "@/components/dashboard/ProductTable";
import { Toast } from "@/components/ui/toast";
import { buildPriceComparisonMatrix, getCompetitorColumns } from "@/lib/price-intelligence";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [rows, setRows] = useState<DashboardPriceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [brand, setBrand] = useState("All");
  const [status, setStatus] = useState("All");
  const [lastRefresh, setLastRefresh] = useState("Never");
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  // Clear toast after timeout
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Load products and latest pricing records
  async function loadData() {
    setLoading(true);
    try {
      // 1. Fetch products catalog
      const productsRes = await fetch("/api/products?limit=1000&pageSize=1000", { cache: "no-store" });
      if (!productsRes.ok) throw new Error("Failed to load products from catalog");
      const productsData = await productsRes.json();
      const productsList = productsData.items || [];

      // 2. Fetch latest prices
      const pricesRes = await fetch("/api/prices/latest", { cache: "no-store" });
      if (!pricesRes.ok) throw new Error("Failed to load latest prices");
      const latestPrices = await pricesRes.json();

      const mappedRows: DashboardPriceRow[] = buildPriceComparisonMatrix(productsList, latestPrices);

      setRows(mappedRows);
      setLastRefresh(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
    } catch (err: any) {
      console.error(err);
      setToast({ message: "Could not retrieve price dashboard data.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Trigger Playwright scraper execution
  async function handleRunScan() {
    if (scanning) return;
    setScanning(true);
    setToast({
      message: "Scraper running in background... Scanning active URLs via Playwright. Please wait.",
      variant: "success"
    });
    
    try {
      const res = await fetch("/api/scrape", { method: "POST" });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Scraper failed to execute");
      }
      
      const scanFailed = Boolean(data.scan_failed);
      const pricesFound = Number(data.prices_found ?? 0);

      if (pricesFound > 0 && !scanFailed) {
        setToast({
          message: `Scraper Scan Finished. Scanned: ${data.products_scanned}, Prices Found: ${pricesFound}, Errors: ${data.errors}`,
          variant: data.errors > 0 ? "error" : "success"
        });
      } else {
        setToast(null);
      }
      
      // Refresh dashboard view
      await loadData();
    } catch (err: any) {
      console.error(err);
      setToast({ message: `Scraper error: ${err.message || String(err)}`, variant: "error" });
    } finally {
      setScanning(false);
    }
  }

  // Extract unique brands for filters
  const brands = useMemo(() => {
    return Array.from(new Set(rows.map((item) => item.brand))).sort();
  }, [rows]);

  // Filter rows based on search parameters
  const filteredRows = useMemo(() => {
    const query = productSearch.trim().toLowerCase();

    return rows.filter((item) => {
      const matchesSearch =
        query.length === 0 ||
        item.productName.toLowerCase().includes(query) ||
        item.brand.toLowerCase().includes(query);
      const matchesBrand = brand === "All" || item.brand === brand;
      const matchesStatus = status === "All" || item.status === status;

      return matchesSearch && matchesBrand && matchesStatus;
    });
  }, [brand, productSearch, status, rows]);

  const competitorColumns = useMemo(() => getCompetitorColumns(rows), [rows]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-white shadow-sm">
              <Radar className="h-6 w-6" />
            </div>
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-normal text-sky-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Retail Intelligence
              </p>
              <h1 className="text-xl font-semibold tracking-normal text-slate-950 sm:text-2xl">
                Market Price Intelligence Dashboard
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="text-right mr-2">
              <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">Last refresh</p>
              <p className="text-sm font-semibold text-slate-900">{lastRefresh}</p>
            </div>
            
            <button
              onClick={handleRunScan}
              disabled={scanning}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                scanning 
                  ? "bg-slate-400 cursor-not-allowed" 
                  : "bg-sky-600 hover:bg-sky-700 active:bg-sky-800"
              )}
            >
              {scanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scanning Prices...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  Run Price Scan
                </>
              )}
            </button>

            <a 
              href="/products"
              className="rounded-full bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Product Catalog
            </a>
            
            <Avatar>
              <AvatarFallback>RM</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <KPICards products={rows} />

        <Filters
          search={productSearch}
          brand={brand}
          status={status}
          brands={brands}
          onSearchChange={setProductSearch}
          onBrandChange={setBrand}
          onStatusChange={setStatus}
          onRefresh={loadData}
        />

        {loading && rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border rounded-2xl">
            <Loader2 className="h-10 w-10 text-sky-600 animate-spin" />
            <p className="mt-4 text-slate-500 font-medium">Loading pricing details...</p>
          </div>
        ) : (
          <ProductTable products={filteredRows} competitorColumns={competitorColumns} />
        )}
      </div>

      {toast && (
        <Toast 
          message={toast.message} 
          variant={toast.variant} 
          visible={Boolean(toast)} 
        />
      )}
    </main>
  );
}
