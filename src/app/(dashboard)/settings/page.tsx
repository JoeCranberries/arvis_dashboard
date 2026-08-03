"use client";

import { useRef, useState } from "react";
import { FaDownload, FaUpload, FaTrashCan, FaKey, FaRightFromBracket } from "react-icons/fa6";
import { PageHeader, Panel } from "@/components/ui";
import { useTheme } from "@/components/ThemeProvider";
import { useSettings } from "@/components/SettingsProvider";
import { api } from "@/lib/api";

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={on}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        on ? "bg-[var(--a-accent)]" : "bg-[var(--a-chip-hover)]"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
          on ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

const inputClass = "a-input px-3.5 py-2.5 text-sm";

export default function SettingsPage() {
  const { theme, toggle } = useTheme();
  const { name, initials, setName, setInitials } = useSettings();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [codeSaved, setCodeSaved] = useState(false);
  const [resetArmed, setResetArmed] = useState(false);
  const [resetText, setResetText] = useState("");

  const changeCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCode.trim().length < 4) return alert("Kode minimal 4 karakter.");
    try {
      await api.post("/api/code", { code: newCode.trim() });
      setNewCode("");
      setCodeSaved(true);
      setTimeout(() => setCodeSaved(false), 2000);
    } catch {
      alert("Gagal mengubah kode.");
    }
  };

  const logout = async () => {
    await api.del("/api/auth").catch(() => {});
    window.location.href = "/unlock";
  };

  const exportData = async () => {
    setBusy(true);
    try {
      const [expenses, income, categories, settings] = await Promise.all([
        api.get("/api/expenses"),
        api.get("/api/income"),
        api.get("/api/categories"),
        api.get("/api/settings"),
      ]);
      const data = { expenses, income, categories, settings };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `arvi-dashboard-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Gagal mengekspor. Pastikan database terhubung.");
    } finally {
      setBusy(false);
    }
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      setBusy(true);
      try {
        const data = JSON.parse(reader.result as string);
        // Replace everything with the backup contents.
        await Promise.all([
          api.del("/api/expenses"),
          api.del("/api/income"),
          api.del("/api/categories"),
        ]);
        for (const x of data.expenses ?? []) await api.post("/api/expenses", x);
        for (const x of data.income ?? []) await api.post("/api/income", x);
        for (const x of data.categories ?? []) await api.post("/api/categories", x);
        if (data.settings) await api.put("/api/settings", data.settings);
        alert("Data berhasil diimpor. Halaman akan dimuat ulang.");
        location.reload();
      } catch {
        alert("File tidak valid atau gagal mengimpor.");
        setBusy(false);
      }
    };
    reader.readAsText(file);
  };

  const resetAll = async () => {
    setBusy(true);
    try {
      await Promise.all([
        api.del("/api/expenses"),
        api.del("/api/income"),
        api.del("/api/categories"),
      ]);
      await api.put("/api/settings", { name: "Arvi's", initials: "AV" });
      location.reload();
    } catch {
      alert("Gagal mereset. Pastikan database terhubung.");
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="Kelola identitas, tampilan, dan data dashboard." />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile */}
        <Panel>
          <h2 className="mb-5 text-base font-semibold text-[var(--a-text)]">Profil</h2>
          <div className="flex flex-col gap-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--a-faint)]">
                Nama Dashboard
              </span>
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--a-faint)]">
                Inisial Badge <span className="text-[var(--a-faint)]">(maks 3 huruf)</span>
              </span>
              <input
                value={initials}
                onChange={(e) => setInitials(e.target.value)}
                maxLength={3}
                className={`${inputClass} w-28 uppercase`}
              />
            </label>
            <p className="text-xs text-[var(--a-faint)]">
              Muncul di sidebar. Perubahan langsung tersimpan ke database.
            </p>
          </div>
        </Panel>

        {/* Appearance */}
        <Panel>
          <h2 className="mb-5 text-base font-semibold text-[var(--a-text)]">Tampilan</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--a-text)]">Mode gelap</p>
              <p className="text-xs text-[var(--a-faint)]">
                Saat ini: {theme === "dark" ? "gelap" : "terang"}
              </p>
            </div>
            <Toggle on={theme === "dark"} onClick={toggle} />
          </div>
        </Panel>

        {/* Data management */}
        <Panel className="lg:col-span-2">
          <h2 className="mb-1 text-base font-semibold text-[var(--a-text)]">Data</h2>
          <p className="mb-5 text-xs text-[var(--a-faint)]">
            Data disimpan di MongoDB. Ekspor untuk cadangan, impor untuk memulihkan.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={exportData}
              disabled={busy}
              className="a-btn-primary flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
            >
              <FaDownload className="text-xs" /> Ekspor Backup
            </button>

            <button
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="a-chip flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm disabled:opacity-60"
            >
              <FaUpload className="text-xs" /> Impor
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              onChange={importData}
              className="hidden"
            />

            {!resetArmed ? (
              <button
                onClick={() => setResetArmed(true)}
                disabled={busy}
                className="flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/20 disabled:opacity-60"
              >
                <FaTrashCan className="text-xs" /> Reset Semua Data
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={resetText}
                  onChange={(e) => setResetText(e.target.value)}
                  placeholder='Ketik "HAPUS"'
                  autoFocus
                  className="a-input w-36 px-3 py-2 text-sm"
                />
                <button
                  onClick={resetAll}
                  disabled={busy || resetText !== "HAPUS"}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FaTrashCan className="text-xs" /> Konfirmasi Hapus
                </button>
                <button
                  onClick={() => {
                    setResetArmed(false);
                    setResetText("");
                  }}
                  className="a-chip rounded-lg px-4 py-2.5 text-sm"
                >
                  Batal
                </button>
              </div>
            )}
          </div>
          <p className="mt-3 text-xs text-[var(--a-faint)]">
            Menghapus semua pengeluaran, pemasukan, dan kategori. Tidak dapat dibatalkan — ketik
            <span className="font-semibold"> HAPUS </span> untuk konfirmasi.
          </p>
        </Panel>

        {/* Security */}
        <Panel className="lg:col-span-2">
          <h2 className="mb-1 text-base font-semibold text-[var(--a-text)]">Keamanan</h2>
          <p className="mb-5 text-xs text-[var(--a-faint)]">
            Kode akses dibutuhkan setiap membuka dashboard.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <form onSubmit={changeCode} className="flex flex-wrap items-end gap-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--a-faint)]">
                  Ubah Kode Akses
                </span>
                <input
                  type="password"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="Kode baru (min 4)"
                  className={`${inputClass} w-48`}
                />
              </label>
              <button
                type="submit"
                className="a-btn-primary flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold"
              >
                <FaKey className="text-xs" /> {codeSaved ? "Tersimpan" : "Simpan Kode"}
              </button>
            </form>

            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/20"
            >
              <FaRightFromBracket className="text-xs" /> Keluar
            </button>
          </div>
        </Panel>
      </div>
    </>
  );
}
