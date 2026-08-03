import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Distinct YYYY-MM months that have any expense or income, sorted ascending.
export async function GET() {
  try {
    const db = await getDb();
    const [exp, inc] = await Promise.all([
      db.collection("expenses").distinct("date"),
      db.collection("income").distinct("date"),
    ]);
    const months = new Set<string>();
    for (const d of [...exp, ...inc]) {
      const s = String(d);
      if (s.length >= 7) months.add(s.slice(0, 7));
    }
    return NextResponse.json([...months].sort());
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
