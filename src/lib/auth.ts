// Signed session token using Web Crypto (works in both the Edge middleware and Node routes).

const enc = new TextEncoder();
const COOKIE = "dash_session";
export const SESSION_COOKIE = COOKIE;
export const SESSION_DAYS = 30;

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmacKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

/** Create a token `v1.<expiryMs>.<hmacHex>`. */
export async function createToken(secret: string, days = SESSION_DAYS): Promise<string> {
  const exp = Date.now() + days * 24 * 60 * 60 * 1000;
  const payload = `v1.${exp}`;
  const sig = toHex(await crypto.subtle.sign("HMAC", await hmacKey(secret), enc.encode(payload)));
  return `${payload}.${sig}`;
}

/** Verify signature + expiry. */
export async function verifyToken(
  token: string | undefined,
  secret: string
): Promise<boolean> {
  if (!token || !secret) return false;
  const i = token.lastIndexOf(".");
  if (i < 0) return false;
  const payload = token.slice(0, i);
  const sig = token.slice(i + 1);
  const expected = toHex(
    await crypto.subtle.sign("HMAC", await hmacKey(secret), enc.encode(payload))
  );
  if (sig !== expected) return false;
  const exp = Number(payload.split(".")[1]);
  return Number.isFinite(exp) && Date.now() < exp;
}
