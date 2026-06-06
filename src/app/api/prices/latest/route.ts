import { NextResponse } from "next/server";
import { getLatestPrices } from "@/lib/json-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const latestPrices = await getLatestPrices();
    return NextResponse.json(latestPrices);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
