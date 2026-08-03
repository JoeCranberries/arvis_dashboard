import { NextResponse, type NextRequest } from "next/server";
import { verifyToken, SESSION_COOKIE } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const ok = await verifyToken(token, process.env.AUTH_SECRET ?? "");
  if (ok) return NextResponse.next();

  // Unauthenticated: block API with 401, redirect pages to /unlock.
  if (req.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/unlock";
  return NextResponse.redirect(url);
}

// Run on everything except static assets, the unlock page, and the auth endpoint
// (so users can actually log in).
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|unlock|api/auth).*)"],
};
