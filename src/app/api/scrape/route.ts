import { NextResponse } from "next/server";
import { runPriceScan } from "@/lib/price-service";

export const maxDuration = 300; // 5 minutes execution window

export async function POST() {
  try {
    const summary = await runPriceScan();
    return NextResponse.json({
      success: true, // Returning true as standard outer response, actual scan success is in summary
      products_scanned: summary.products_scanned,
      prices_found: summary.prices_found,
      errors: summary.errors,
      scan_failed: !summary.success
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, scan_failed: true, error: err.message || String(err) },
      { status: 500 }
    );
  }
}
