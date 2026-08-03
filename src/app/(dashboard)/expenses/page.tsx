"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  FaPlus,
  FaMagnifyingGlass,
  FaPenToSquare,
  FaTrashCan,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaTags,
} from "react-icons/fa6";
import { PageHeader, Panel } from "@/components/ui";
import { useExpenses } from "@/hooks/useExpenses";
import { useCategories } from "@/hooks/useCategories";
import { useMonth } from "@/components/MonthProvider";
import { useDialog } from "@/components/ConfirmProvider";
import {
  formatIDR,
  formatDayDate,
  styleFor,
  type Category,
  type Expense,
} from "@/lib/expenses";

const curMonth = () => new Date().toISOString().slice(0, 10).slice(0, 7);
const firstOf = (ym: string) => `${ym}-01`;
const lastOf = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return `${ym}-${String(new Date(y, m, 0).getDate()).padStart(2, "0")}`;
};

function CategorySelect({
  value,
  categories,
  onChange,
}: {
  value: string;
  categories: Category[];
  onChange: (c: string) => void;
}) {
  const st = styleFor(categories, value);
  return (
    <div className="relative inline-block">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ background: st.bg, color: st.fg }}
        className="cursor-pointer appearance-none rounded-full py-1 pl-3 pr-7 text-xs font-medium outline-none"
      >
        {!categories.some((c) => c.name === value) && <option value={value}>{value}</option>}
        {categories.map((c) => (
          <option key={c.name} value={c.name}>
            {c.name}
          </option>
        ))}
      </select>
      <FaChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px]"
        style={{ color: st.fg }}
      />
    </div>
  );
}

const today = new Date().toISOString().slice(0, 10);

export default function ExpensesPage() {
  const { months } = useMonth();
  const { confirm } = useDialog();

  // Custom date range (defaults to the latest month that has data).
  const [from, setFrom] = useState(() => firstOf(curMonth()));
  const [to, setTo] = useState(() => lastOf(curMonth()));
  const autoSet = useRef(false);
  useEffect(() => {
    if (autoSet.current || months.length === 0) return;
    autoSet.current = true;
    const latest = months[months.length - 1];
    setFrom(firstOf(latest));
    setTo(lastOf(latest));
  }, [months]);

  const { expenses, add, update, remove } = useExpenses({ from, to });
  const { list: categories } = useCategories();

  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ date: today, item: "", price: "", category: "" });

  const all = useMemo(() => expenses ?? [], [expenses]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? all.filter((e) => e.item.toLowerCase().includes(q)) : all;
  }, [all, query]);

  const groups = useMemo(() => {
    const map = new Map<string, Expense[]>();
    for (const e of filtered) {
      const arr = map.get(e.date) ?? [];
      arr.push(e);
      map.set(e.date, arr);
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1));
  }, [filtered]);

  const dayCount = new Set(all.map((e) => e.date)).size;

  // Pagination — only kicks in for large months; never splits a day's group.
  const PAGE_ROWS = 30;
  const PAGINATE_THRESHOLD = 60;
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [query, from, to]);

  const pages = useMemo(() => {
    if (filtered.length <= PAGINATE_THRESHOLD) return [groups];
    const out: [string, Expense[]][][] = [];
    let cur: [string, Expense[]][] = [];
    let count = 0;
    for (const g of groups) {
      if (cur.length && count + g[1].length > PAGE_ROWS) {
        out.push(cur);
        cur = [];
        count = 0;
      }
      cur.push(g);
      count += g[1].length;
    }
    if (cur.length) out.push(cur);
    return out;
  }, [groups, filtered.length]);

  const totalPages = pages.length;
  const curPage = Math.min(page, totalPages);
  const pageGroups = pages[curPage - 1] ?? [];

  const defaultCat = () => categories[0]?.name ?? "";

  const openAdd = () => {
    setForm({ date: today, item: "", price: "", category: defaultCat() });
    setEditingId(null);
    setShowForm(true);
  };
  const openEdit = (e: Expense) => {
    setForm({ date: e.date, item: e.item, price: String(e.price), category: e.category });
    setEditingId(e.id);
    setShowForm(true);
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const price = Number(form.price);
    if (!form.item.trim() || !form.price || isNaN(price) || price < 0 || !form.category) return;
    const payload = { date: form.date, item: form.item.trim(), price, category: form.category };
    if (editingId) update(editingId, payload);
    else add(payload);
    setShowForm(false);
    setEditingId(null);
  };

  return (
    <>
      <PageHeader
        title="Household Expenses"
        subtitle="Catat pengeluaran harian rumah tangga. Tersimpan otomatis ke database."
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={from}
            max={to}
            onChange={(e) => setFrom(e.target.value)}
            className="a-input w-auto px-3 py-2 text-sm"
            aria-label="Dari tanggal"
          />
          <span className="text-sm text-[var(--a-faint)]">—</span>
          <input
            type="date"
            value={to}
            min={from}
            onChange={(e) => setTo(e.target.value)}
            className="a-input w-auto px-3 py-2 text-sm"
            aria-label="Sampai tanggal"
          />
          <div className="relative w-full sm:max-w-[160px]">
            <FaMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--a-faint)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari item…"
              className="a-input py-2 pl-9 pr-3 text-sm"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/categories"
            className="a-chip flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
          >
            <FaTags className="text-xs" /> Kategori
          </Link>
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
          <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
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
              <span className="mb-1 block text-xs font-medium text-[var(--a-faint)]">Item</span>
              <input
                value={form.item}
                onChange={(e) => setForm({ ...form, item: e.target.value })}
                placeholder="mis. Nasi goreng"
                className="a-input px-3 py-2 text-sm"
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-[var(--a-faint)]">Harga (Rp)</span>
              <input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0"
                className="a-input px-3 py-2 text-sm"
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-[var(--a-faint)]">Kategori</span>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="a-input px-3 py-2 text-sm"
                required
              >
                {categories.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex gap-2 sm:col-span-2 lg:col-span-5">
              <button type="submit" className="a-btn-primary rounded-lg px-4 py-2 text-sm font-semibold">
                {editingId ? "Simpan perubahan" : "Tambah pengeluaran"}
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
        {expenses === null ? (
          <p className="py-16 text-center text-sm text-[var(--a-faint)]">Memuat…</p>
        ) : groups.length === 0 ? (
          <p className="py-16 text-center text-sm text-[var(--a-faint)]">
            {query ? "Tidak ada hasil." : "Belum ada pengeluaran."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--a-border)] text-xs uppercase tracking-wide text-[var(--a-faint)]">
                  <th className="px-4 py-3 font-medium">Day, Date</th>
                  <th className="px-4 py-3 font-medium">List</th>
                  <th className="px-4 py-3 text-right font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {pageGroups.map(([date, items]) => {
                  const subtotal = items.reduce((s, e) => s + e.price, 0);
                  return items.map((e, idx) => (
                    <tr
                      key={e.id}
                      className="border-b border-[var(--a-border)] hover:bg-[var(--a-panel-hover)]"
                    >
                      {idx === 0 && (
                        <td
                          rowSpan={items.length}
                          className="border-r border-[var(--a-border)] px-4 py-3 align-top"
                        >
                          <div className="whitespace-nowrap font-semibold text-[var(--a-text)]">
                            {formatDayDate(date)}
                          </div>
                          <div className="mt-1 text-xs text-[var(--a-faint)]">
                            Subtotal: {formatIDR(subtotal)}
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-3 text-[var(--a-text)]">{e.item}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-[var(--a-text)]">
                        {formatIDR(e.price)}
                      </td>
                      <td className="px-4 py-3">
                        <CategorySelect
                          value={e.category}
                          categories={categories}
                          onChange={(c) => update(e.id, { category: c })}
                        />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <button
                          onClick={() => openEdit(e)}
                          className="a-chip mr-1 rounded-md p-1.5"
                          aria-label="Edit"
                        >
                          <FaPenToSquare className="text-xs" />
                        </button>
                        <button
                          onClick={async () => {
                            if (
                              await confirm({
                                title: "Hapus pengeluaran?",
                                message: `"${e.item}" (${formatIDR(e.price)}) akan dihapus.`,
                                confirmLabel: "Hapus",
                                danger: true,
                              })
                            )
                              remove(e.id);
                          }}
                          className="a-chip rounded-md p-1.5 text-red-500"
                          aria-label="Hapus"
                        >
                          <FaTrashCan className="text-xs" />
                        </button>
                      </td>
                    </tr>
                  ));
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[var(--a-border)] font-semibold text-[var(--a-text)]">
                  <td className="px-4 py-3" colSpan={2}>
                    Total {query ? "(hasil filter)" : `(${dayCount} hari)`}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                    {formatIDR(filtered.reduce((s, e) => s + e.price, 0))}
                  </td>
                  <td className="px-4 py-3" colSpan={2} />
                </tr>
              </tfoot>
            </table>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 border-t border-[var(--a-border)] px-4 py-3">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={curPage === 1}
                  className="a-chip flex h-8 w-8 items-center justify-center rounded-lg disabled:opacity-40"
                  aria-label="Halaman sebelumnya"
                >
                  <FaChevronLeft className="text-xs" />
                </button>
                <span className="text-sm text-[var(--a-muted)]">
                  Halaman {curPage} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={curPage === totalPages}
                  className="a-chip flex h-8 w-8 items-center justify-center rounded-lg disabled:opacity-40"
                  aria-label="Halaman berikutnya"
                >
                  <FaChevronRight className="text-xs" />
                </button>
              </div>
            )}
          </div>
        )}
      </Panel>
    </>
  );
}
