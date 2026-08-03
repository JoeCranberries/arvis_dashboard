import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT = { name: "Arvi's", initials: "AV" };

export async function GET() {
  try {
    const db = await getDb();
    const doc = await db
      .collection("settings")
      .findOne({ key: "app" }, { projection: { _id: 0, key: 0 } });
    return NextResponse.json(doc ?? DEFAULT);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const b = await req.json();
    const set = { name: String(b.name ?? DEFAULT.name), initials: String(b.initials ?? DEFAULT.initials) };
    const db = await getDb();
    await db.collection("settings").updateOne({ key: "app" }, { $set: set }, { upsert: true });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
