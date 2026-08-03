import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Change the shared access code. Protected by middleware (must be unlocked).
// Single shared code → replace whatever is stored.
export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    const value = String(code ?? "").trim();
    if (value.length < 4) {
      return NextResponse.json({ error: "Kode minimal 4 karakter." }, { status: 400 });
    }
    const db = await getDb();
    await db.collection("codes").deleteMany({});
    await db.collection("codes").insertOne({ code: value });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
