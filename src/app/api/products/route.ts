import { NextRequest, NextResponse } from "next/server";
import { normalizeText, requiredField } from "@/lib/validators";
import { getProducts, createProduct } from "@/lib/data-store";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const search = normalizeText(url.searchParams.get("search") ?? "") || null;
  const page = Math.max(Number(url.searchParams.get("page") ?? "1"), 1);
  const pageSize = Math.max(Number(url.searchParams.get("pageSize") ?? "10"), 1);
  const offset = (page - 1) * pageSize;
  try {
    const { items, total } = await getProducts({ search: search ?? undefined, limit: pageSize, offset });
    return NextResponse.json({ success: true, items, total, page, pageSize });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const name = normalizeText(body.name);
  const category = normalizeText(body.category) || null;
  const brand = normalizeText(body.brand) || null;
  const ourPrice = body.our_price === undefined || body.our_price === null ? null : Number(body.our_price);
  const description = normalizeText(body.description) || null;
  const active = body.active !== false;

  if (!requiredField(name)) {
    return NextResponse.json({ success: false, error: "Product name is required." }, { status: 400 });
  }
  try {
    const product = await createProduct({
      name,
      category: category ?? undefined,
      brand: brand ?? undefined,
      our_price: Number.isFinite(ourPrice) ? ourPrice : null,
      description: description ?? undefined,
      active
    });
    return NextResponse.json({ success: true, ...product }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}
