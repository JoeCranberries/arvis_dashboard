// Tiny fetch wrapper for the JSON API routes.

async function req(url: string, opts?: RequestInit) {
  const r = await fetch(url, { ...opts, cache: "no-store" });
  if (!r.ok) throw new Error(`${r.status} ${await r.text().catch(() => "")}`);
  const txt = await r.text();
  return txt ? JSON.parse(txt) : null;
}

const jsonInit = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const api = {
  get: (u: string) => req(u),
  post: (u: string, b: unknown) => req(u, jsonInit("POST", b)),
  patch: (u: string, b: unknown) => req(u, jsonInit("PATCH", b)),
  put: (u: string, b: unknown) => req(u, jsonInit("PUT", b)),
  del: (u: string) => req(u, { method: "DELETE" }),
};
