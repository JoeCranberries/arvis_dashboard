import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const sp = new URL(req.url).searchParams;
    const month = sp.get("month");
    const from = sp.get("from");
    const to = sp.get("to");
    const isDate = (s: string | null) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
    let filter: Record<string, unknown> = {};
    if (isDate(from) && isDate(to)) filter = { date: { $gte: from, $lte: to } };
    else if (month && /^\d{4}-\d{2}$/.test(month)) filter = { date: { $regex: `^${month}-` } };
    const db = await getDb();
    const docs = await db
      .collection("expenses")
      .find(filter, { projection: { _id: 0 } })
      .toArray();
    return NextResponse.json(docs);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const doc = {
      id: typeof b.id === "string" ? b.id : crypto.randomUUID(),
      date: String(b.date),
      item: String(b.item),
      price: Number(b.price),
      category: String(b.category),
    };
    const db = await getDb();
    await db.collection("expenses").insertOne({ ...doc });
    return NextResponse.json(doc, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// Clear all (used by "Reset").
export async function DELETE() {
  try {
    const db = await getDb();
    await db.collection("expenses").deleteMany({});
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
