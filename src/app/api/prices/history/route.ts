import { NextResponse } from "next/server";
import { getPriceHistory } from "@/lib/json-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const history = await getPriceHistory();
    return NextResponse.json(history);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
