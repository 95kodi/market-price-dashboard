import { NextRequest, NextResponse } from "next/server";
import { normalizeText, requiredField, isValidUrl } from "@/lib/validators";
import { updateProductUrl, deleteProductUrl } from "@/lib/data-store";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (Number.isNaN(id) || id < 1) {
    return NextResponse.json({ success: false, error: "Invalid URL ID." }, { status: 400 });
  }

  const body = await request.json();
  const productUrl = normalizeText(body.product_url);
  const active = body.active === true;

  if (!requiredField(productUrl) || !isValidUrl(productUrl)) {
    return NextResponse.json({ success: false, error: "A valid product URL is required." }, { status: 400 });
  }
  try {
    const updated = await updateProductUrl(id, { product_url: productUrl, active });
    if (!updated) return NextResponse.json({ success: false, error: "URL record not found." }, { status: 404 });
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (Number.isNaN(id) || id < 1) {
    return NextResponse.json({ success: false, error: "Invalid URL ID." }, { status: 400 });
  }
  try {
    await deleteProductUrl(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: String(err?.message ?? err) }, { status: 500 });
  }
}
