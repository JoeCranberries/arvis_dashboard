import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ name: string }> };

// Rename / recolor. Cascade to expenses is handled client-side.
export async function PUT(req: Request, { params }: Ctx) {
  try {
    const { name: oldName } = await params;
    const b = await req.json();
    const set = { name: String(b.name), bg: String(b.bg), fg: String(b.fg) };
    const db = await getDb();
    await db.collection("categories").updateOne({ name: oldName }, { $set: set });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const { name } = await params;
    const db = await getDb();
    await db.collection("categories").deleteOne({ name });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
