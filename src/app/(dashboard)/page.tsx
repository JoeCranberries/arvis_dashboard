"use client";

import { useMemo } from "react";
import Link from "next/link";
import { FaWallet, FaCalendarDay, FaListUl, FaChartLine } from "react-icons/fa6";
import { PageHeader, StatCard, Panel } from "@/components/ui";
import { useExpenses } from "@/hooks/useExpenses";
import { useCategories } from "@/hooks/useCategories";
import { useMonth } from "@/components/MonthProvider";
import MonthPicker from "@/components/MonthPicker";
import { formatIDR, formatShortDate, styleFor } from "@/lib/expenses";

export default function Overview() {
  const { month } = useMonth();
  const { expenses } = useExpenses(month);
  const { list: categories } = useCategories();

  const all = useMemo(() => expenses ?? [], [expenses]);

  const grand = all.reduce((s, e) => s + e.price, 0);
  const dayCount = new Set(all.map((e) => e.date)).size;
  const avg = dayCount ? grand / dayCount : 0;

  // Spending per day (chart).
  const perDay = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of all) m.set(e.date, (m.get(e.date) ?? 0) + e.price);
    return [...m.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1));
  }, [all]);
  const maxDay = Math.max(1, ...perDay.map(([, v]) => v));

  // Spending per category (breakdown).
  const perCat = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of all) m.set(e.category, (m.get(e.category) ?? 0) + e.price);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [all]);
  const maxCat = Math.max(1, ...perCat.map(([, v]) => v));

  const recent = all.slice(-5).reverse();

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader title="Overview" subtitle="Ringkasan pengeluaran rumah tangga Anda." />
        <MonthPicker />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Pengeluaran" value={formatIDR(grand)} icon={<FaWallet />} />
        <StatCard label="Jumlah Hari" value={`${dayCount} HARI`} icon={<FaCalendarDay />} />
        <StatCard label="Jumlah Item" value={all.length} icon={<FaListUl />} />
        <StatCard label="Rata-rata / Hari" value={formatIDR(avg)} icon={<FaChartLine />} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Per-day chart */}
        <Panel className="lg:col-span-2">
          <h2 className="mb-6 text-base font-semibold text-[var(--a-text)]">Pengeluaran per hari</h2>
          {perDay.length === 0 ? (
            <p className="py-10 text-center text-sm text-[var(--a-faint)]">Belum ada data.</p>
          ) : (
            <div className="flex h-56 items-end justify-between gap-3">
              {perDay.map(([date, v]) => (
                <div key={date} className="flex flex-1 flex-col items-center justify-end">
                  <span className="mb-1 text-[10px] text-[var(--a-faint)]">
                    {Math.round(v / 1000)}k
                  </span>
                  <div
                    className="w-full rounded-t-md bg-[var(--a-accent)] transition-all"
                    style={{ height: `${Math.max(6, (v / maxDay) * 170)}px` }}
                    title={formatIDR(v)}
                  />
                  <span className="mt-2 whitespace-nowrap text-xs text-[var(--a-faint)]">
                    {formatShortDate(date)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* Category breakdown */}
        <Panel>
          <h2 className="mb-4 text-base font-semibold text-[var(--a-text)]">Per kategori</h2>
          {perCat.length === 0 ? (
            <p className="py-10 text-center text-sm text-[var(--a-faint)]">Belum ada data.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {perCat.map(([name, v]) => {
                const st = styleFor(categories, name);
                return (
                  <li key={name}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 text-[var(--a-text)]">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: st.bg }}
                        />
                        {name}
                      </span>
                      <span className="tabular-nums text-[var(--a-muted)]">{formatIDR(v)}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--a-chip)]">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(v / maxCat) * 100}%`, background: st.bg }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>

      {/* Recent expenses */}
      <div className="mt-6">
        <Panel>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-[var(--a-text)]">Pengeluaran terbaru</h2>
            <Link href="/expenses" className="text-sm text-[var(--a-muted)] hover:text-[var(--a-text)]">
              Lihat semua →
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--a-faint)]">Belum ada pengeluaran.</p>
          ) : (
            <ul className="divide-y divide-[var(--a-border)]">
              {recent.map((e) => {
                const st = styleFor(categories, e.category);
                return (
                  <li key={e.id} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[var(--a-text)]">{e.item}</p>
                      <p className="text-xs text-[var(--a-faint)]">{formatShortDate(e.date)}</p>
                    </div>
                    <span
                      className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{ background: st.bg, color: st.fg }}
                    >
                      {e.category}
                    </span>
                    <span className="w-24 shrink-0 text-right text-sm tabular-nums text-[var(--a-text)]">
                      {formatIDR(e.price)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
