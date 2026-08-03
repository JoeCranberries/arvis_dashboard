import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { DEFAULT_CATEGORIES } from "@/lib/expenses";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();
    const col = db.collection("categories");
    const found = await col.find({}, { projection: { _id: 0 } }).toArray();
    // Seed defaults on first run so the app is usable.
    if (found.length === 0) {
      // insertMany mutates its argument (adds _id), so insert throwaway copies
      // and return fresh clean ones.
      await col.insertMany(DEFAULT_CATEGORIES.map((c) => ({ ...c })));
      return NextResponse.json(DEFAULT_CATEGORIES.map((c) => ({ ...c })));
    }
    return NextResponse.json(found);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const doc = { name: String(b.name), bg: String(b.bg), fg: String(b.fg) };
    const db = await getDb();
    await db.collection("categories").insertOne({ ...doc });
    return NextResponse.json(doc, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// Clear all — the client re-seeds defaults via GET afterwards.
export async function DELETE() {
  try {
    const db = await getDb();
    await db.collection("categories").deleteMany({});
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
