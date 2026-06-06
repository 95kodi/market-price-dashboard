import { BadgeIndianRupee, CircleCheck, CircleX, PackageSearch } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardPriceRow } from "./ProductTable";
import { formatCurrency } from "./formatters";

type KPICardsProps = {
  products: DashboardPriceRow[];
};

export function KPICards({ products }: KPICardsProps) {
  const totalProducts = products.length;
  const winning = products.filter((item) => item.status === "Winning").length;
  const losing = products.filter((item) => item.status === "Losing").length;
  const entriesWithGap = products.filter((item) => item.priceGap !== null);
  const averageGap = entriesWithGap.length > 0
    ? Math.round(
        entriesWithGap.reduce((sum, item) => sum + Math.abs(item.priceGap || 0), 0) / entriesWithGap.length
      )
    : 0;

  const cards = [
    {
      label: "Total Products",
      value: totalProducts.toLocaleString("en-IN"),
      icon: <PackageSearch className="h-5 w-5" />,
      tone: "bg-sky-50 text-sky-700 border-sky-100"
    },
    {
      label: "Average Price Gap",
      value: formatCurrency(averageGap),
      icon: <BadgeIndianRupee className="h-5 w-5" />,
      tone: "bg-amber-50 text-amber-700 border-amber-100"
    },
    {
      label: "Winning Products",
      value: winning.toLocaleString("en-IN"),
      icon: <CircleCheck className="h-5 w-5" />,
      tone: "bg-emerald-50 text-emerald-700 border-emerald-100"
    },
    {
      label: "Losing Products",
      value: losing.toLocaleString("en-IN"),
      icon: <CircleX className="h-5 w-5" />,
      tone: "bg-red-50 text-red-700 border-red-100"
    }
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="overflow-hidden">
          <CardContent className="flex items-center justify-between gap-4 p-5">
            <div className="min-w-0">
              <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">{card.value}</p>
            </div>
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md border ${card.tone}`}>
              {card.icon}
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
