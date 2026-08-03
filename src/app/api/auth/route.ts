import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { createToken, SESSION_COOKIE, SESSION_DAYS } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST { code } → verify against the codes collection, set a signed session cookie.
export async function POST(req: Request) {
  try {
    const secret = process.env.AUTH_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "AUTH_SECRET not set" }, { status: 500 });
    }
    const { code } = await req.json();
    const db = await getDb();
    const match = await db.collection("codes").findOne({ code: String(code ?? "") });
    if (!match) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
    const token = await createToken(secret);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DAYS * 24 * 60 * 60,
      secure: process.env.NODE_ENV === "production",
    });
    return res;
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// Logout — clear the cookie.
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
