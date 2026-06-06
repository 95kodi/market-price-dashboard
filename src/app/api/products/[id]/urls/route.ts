import { NextRequest, NextResponse } from "next/server";
import { normalizeText, requiredField, isValidUrl } from "@/lib/validators";
import { getProductUrls, createProductUrl } from "@/lib/data-store";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const productId = Number(idStr);
  if (Number.isNaN(productId) || productId < 1) {
    return NextResponse.json({ success: false, error: "Invalid product ID." }, { status: 400 });
  }
  try {
    const urls = await getProductUrls(productId);
    // Return raw array for compatibility with existing UI
    return NextResponse.json(urls);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const productId = Number(idStr);
  if (Number.isNaN(productId) || productId < 1) {
    return NextResponse.json({ success: false, error: "Invalid product ID." }, { status: 400 });
  }

  const body = await request.json();
  const storeName = normalizeText(body.store_name);
  const productUrl = normalizeText(body.product_url);
  const active = body.active !== false;

  if (!requiredField(storeName)) {
    return NextResponse.json({ success: false, error: "Store name is required." }, { status: 400 });
  }

  if (!requiredField(productUrl) || !isValidUrl(productUrl)) {
    return NextResponse.json({ success: false, error: "A valid product URL is required." }, { status: 400 });
  }
  try {
    const created = await createProductUrl(productId, { store_name: storeName, product_url: productUrl, active });
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: String(err?.message ?? err) }, { status: 400 });
  }
}
