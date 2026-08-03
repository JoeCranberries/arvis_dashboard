"use client";

import { useState } from "react";
import { FaLock } from "react-icons/fa6";
import { useSettings } from "@/components/SettingsProvider";

export default function UnlockPage() {
  const { name } = useSettings();
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    setError(false);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      if (res.ok) {
        window.location.href = "/";
      } else {
        setError(true);
        setBusy(false);
      }
    } catch {
      setError(true);
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="a-panel w-full max-w-sm p-8 text-center">
        <div className="a-btn-primary mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl">
          <FaLock />
        </div>
        <h1 className="text-xl font-semibold text-[var(--a-text)]">{name}</h1>
        <p className="mb-6 mt-1 text-sm text-[var(--a-muted)]">Masukkan kode akses untuk membuka.</p>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            type="password"
            inputMode="numeric"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError(false);
            }}
            placeholder="Kode akses"
            autoFocus
            className={`a-input px-4 py-3 text-center text-lg tracking-widest ${
              error ? "border-red-500" : ""
            }`}
          />
          {error && <p className="text-sm text-red-500">Kode salah. Coba lagi.</p>}
          <button
            type="submit"
            disabled={busy}
            className="a-btn-primary rounded-lg px-4 py-3 text-sm font-semibold disabled:opacity-60"
          >
            {busy ? "Membuka…" : "Buka"}
          </button>
        </form>
      </div>
    </div>
  );
}
