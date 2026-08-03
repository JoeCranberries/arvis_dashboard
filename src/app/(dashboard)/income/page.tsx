"use client";

import { useMemo, useState } from "react";
import {
  FaPlus,
  FaPenToSquare,
  FaTrashCan,
  FaArrowTrendUp,
  FaArrowTrendDown,
  FaScaleBalanced,
} from "react-icons/fa6";
import { PageHeader, StatCard, Panel } from "@/components/ui";
import { useIncome } from "@/hooks/useIncome";
import { useExpenses } from "@/hooks/useExpenses";
import { useMonth } from "@/components/MonthProvider";
import MonthPicker from "@/components/MonthPicker";
import { formatIDR, formatShortDate } from "@/lib/expenses";
import { type Income } from "@/lib/income";

const today = new Date().toISOString().slice(0, 10);

export default function IncomePage() {
  const { month } = useMonth();
  const { income, add, update, remove } = useIncome(month);
  const { expenses } = useExpenses(month);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ date: today, source: "", amount: "" });

  const inc = useMemo(() => income ?? [], [income]);
  const exp = useMemo(() => expenses ?? [], [expenses]);

  const totalIn = inc.reduce((s, i) => s + i.amount, 0);
  const totalOut = exp.reduce((s, e) => s + e.price, 0);
  const balance = totalIn - totalOut;

  // Running-balance ledger: income (+) and expenses (−) merged chronologically.
  const ledger = useMemo(() => {
    const rows = [
      ...inc.map((i) => ({ key: "i" + i.id, date: i.date, desc: i.source, cin: i.amount, cout: 0 })),
      ...exp.map((e) => ({ key: "e" + e.id, date: e.date, desc: e.item, cin: 0, cout: e.price })),
    ].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    let bal = 0;
    return rows.map((r) => {
      bal += r.cin - r.cout;
      return { ...r, balance: bal };
    });
  }, [inc, exp]);

  const incomeSorted = useMemo(
    () => [...inc].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [inc]
  );

  const openAdd = () => {
    setForm({ date: today, source: "", amount: "" });
    setEditingId(null);
    setShowForm(true);
  };
  const openEdit = (i: Income) => {
    setForm({ date: i.date, source: i.source, amount: String(i.amount) });
    setEditingId(i.id);
    setShowForm(true);
  };
  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const amount = Number(form.amount);
    if (!form.source.trim() || !form.amount || isNaN(amount) || amount < 0) return;
    const payload = { date: form.date, source: form.source.trim(), amount };
    if (editingId) update(editingId, payload);
    else add(payload);
    setShowForm(false);
    setEditingId(null);
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Income & Balance"
          subtitle="Saldo per bulan (pemasukan − pengeluaran)."
        />
        <MonthPicker />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Pemasukan" value={formatIDR(totalIn)} icon={<FaArrowTrendUp />} />
        <StatCard label="Total Pengeluaran" value={formatIDR(totalOut)} icon={<FaArrowTrendDown />} />
        <StatCard
          label="Saldo"
          value={
            <span style={{ color: balance >= 0 ? "#16a34a" : "#dc2626" }}>{formatIDR(balance)}</span>
          }
          hint={balance >= 0 ? "Surplus" : "Defisit"}
          icon={<FaScaleBalanced />}
        />
      </div>

      {/* Income management */}
      <div className="mt-6 mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-[var(--a-text)]">Pemasukan</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={openAdd}
            className="a-btn-primary flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold"
          >
            <FaPlus className="text-xs" /> Tambah
          </button>
        </div>
      </div>

      {showForm && (
        <Panel className="mb-4">
          <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-[var(--a-faint)]">Tanggal</span>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="a-input px-3 py-2 text-sm"
                required
              />
            </label>
            <label className="block lg:col-span-2">
              <span className="mb-1 block text-xs font-medium text-[var(--a-faint)]">Sumber</span>
              <input
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                placeholder="mis. Gaji, Bonus, Freelance"
                className="a-input px-3 py-2 text-sm"
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-[var(--a-faint)]">Jumlah (Rp)</span>
              <input
                type="number"
                min={0}
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0"
                className="a-input px-3 py-2 text-sm"
                required
              />
            </label>
            <div className="flex gap-2 sm:col-span-2 lg:col-span-4">
              <button type="submit" className="a-btn-primary rounded-lg px-4 py-2 text-sm font-semibold">
                {editingId ? "Simpan perubahan" : "Tambah pemasukan"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="a-chip rounded-lg px-4 py-2 text-sm"
              >
                Batal
              </button>
            </div>
          </form>
        </Panel>
      )}

      <Panel className="overflow-hidden p-0">
        {income === null ? (
          <p className="py-12 text-center text-sm text-[var(--a-faint)]">Memuat…</p>
        ) : incomeSorted.length === 0 ? (
          <p className="py-12 text-center text-sm text-[var(--a-faint)]">Belum ada pemasukan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--a-border)] text-xs uppercase tracking-wide text-[var(--a-faint)]">
                  <th className="px-4 py-3 font-medium">Tanggal</th>
                  <th className="px-4 py-3 font-medium">Sumber</th>
                  <th className="px-4 py-3 text-right font-medium">Jumlah</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {incomeSorted.map((i) => (
                  <tr
                    key={i.id}
                    className="border-b border-[var(--a-border)] last:border-0 hover:bg-[var(--a-panel-hover)]"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-[var(--a-muted)]">
                      {formatShortDate(i.date)}
                    </td>
                    <td className="px-4 py-3 text-[var(--a-text)]">{i.source}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-emerald-500">
                      +{formatIDR(i.amount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        onClick={() => openEdit(i)}
                        className="a-chip mr-1 rounded-md p-1.5"
                        aria-label="Edit"
                      >
                        <FaPenToSquare className="text-xs" />
                      </button>
                      <button
                        onClick={() => remove(i.id)}
                        className="a-chip rounded-md p-1.5 text-red-500"
                        aria-label="Hapus"
                      >
                        <FaTrashCan className="text-xs" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Running balance ledger */}
      <h2 className="mt-8 mb-4 text-base font-semibold text-[var(--a-text)]">
        Riwayat Saldo (Cash Flow)
      </h2>
      <Panel className="overflow-hidden p-0">
        <div className="max-h-[28rem] overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-[var(--a-panel)] backdrop-blur">
              <tr className="border-b border-[var(--a-border)] text-xs uppercase tracking-wide text-[var(--a-faint)]">
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Keterangan</th>
                <th className="px-4 py-3 text-right font-medium">Masuk</th>
                <th className="px-4 py-3 text-right font-medium">Keluar</th>
                <th className="px-4 py-3 text-right font-medium">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((r) => (
                <tr
                  key={r.key}
                  className="border-b border-[var(--a-border)] last:border-0 hover:bg-[var(--a-panel-hover)]"
                >
                  <td className="whitespace-nowrap px-4 py-2.5 text-[var(--a-muted)]">
                    {formatShortDate(r.date)}
                  </td>
                  <td className="px-4 py-2.5 text-[var(--a-text)]">{r.desc}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-right tabular-nums text-emerald-500">
                    {r.cin ? formatIDR(r.cin) : "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-right tabular-nums text-red-500">
                    {r.cout ? formatIDR(r.cout) : "—"}
                  </td>
                  <td
                    className="whitespace-nowrap px-4 py-2.5 text-right font-medium tabular-nums"
                    style={{ color: r.balance >= 0 ? "var(--a-text)" : "#dc2626" }}
                  >
                    {formatIDR(r.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
