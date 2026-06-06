import { NextRequest, NextResponse } from "next/server";
import { normalizeText, requiredField } from "@/lib/validators";
import { getProductById, updateProduct, deleteProduct } from "@/lib/data-store";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (Number.isNaN(id) || id < 1) {
    return NextResponse.json({ success: false, error: "Invalid product ID." }, { status: 400 });
  }
  try {
    const product = await getProductById(id);
    if (!product) return NextResponse.json({ success: false, error: "Product not found." }, { status: 404 });
    return NextResponse.json({ success: true, ...product });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (Number.isNaN(id) || id < 1) {
    return NextResponse.json({ success: false, error: "Invalid product ID." }, { status: 400 });
  }

  const body = await request.json();
  const name = normalizeText(body.name);
  const category = normalizeText(body.category) || null;
  const brand = normalizeText(body.brand) || null;
  const ourPrice = body.our_price === undefined || body.our_price === null ? undefined : Number(body.our_price);
  const description = normalizeText(body.description) || null;
  const active = body.active === true;

  if (!requiredField(name)) {
    return NextResponse.json({ success: false, error: "Product name is required." }, { status: 400 });
  }
  try {
    const updated = await updateProduct(id, {
      name,
      category: category ?? undefined,
      brand: brand ?? undefined,
      our_price: Number.isFinite(ourPrice) ? ourPrice : undefined,
      description: description ?? undefined,
      active
    });
    if (!updated) return NextResponse.json({ success: false, error: "Product not found." }, { status: 404 });
    return NextResponse.json({ success: true, ...updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (Number.isNaN(id) || id < 1) {
    return NextResponse.json({ success: false, error: "Invalid product ID." }, { status: 400 });
  }
  try {
    await deleteProduct(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}
