import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const b = await req.json();
    const set: Record<string, unknown> = {};
    if ("date" in b) set.date = String(b.date);
    if ("item" in b) set.item = String(b.item);
    if ("price" in b) set.price = Number(b.price);
    if ("category" in b) set.category = String(b.category);
    const db = await getDb();
    await db.collection("expenses").updateOne({ id }, { $set: set });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const db = await getDb();
    await db.collection("expenses").deleteOne({ id });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
