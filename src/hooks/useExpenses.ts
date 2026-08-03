"use client";

import { useCallback, useEffect, useState } from "react";
import { Expense } from "@/lib/expenses";
import { api } from "@/lib/api";

type Opts = { month?: string; from?: string; to?: string };

/**
 * Load expenses. Pass nothing for all data, `{month}` for a month, or
 * `{from, to}` for a custom date range (YYYY-MM-DD).
 */
export function useExpenses(opts?: Opts) {
  const { month, from, to } = opts ?? {};
  const qs = from && to ? `?from=${from}&to=${to}` : month ? `?month=${month}` : "";

  const [expenses, setExpenses] = useState<Expense[] | null>(null);

  const load = useCallback(async () => {
    setExpenses(null);
    try {
      setExpenses(await api.get(`/api/expenses${qs}`));
    } catch {
      setExpenses([]);
    }
  }, [qs]);

  useEffect(() => {
    load();
  }, [load]);

  const matches = (date: string) => {
    if (from && to) return date >= from && date <= to;
    if (month) return date.startsWith(month);
    return true;
  };

  const add = (e: Omit<Expense, "id">) => {
    const doc: Expense = { ...e, id: crypto.randomUUID() };
    if (matches(e.date)) setExpenses((prev) => [...(prev ?? []), doc]);
    api.post("/api/expenses", doc).catch(() => load());
  };

  const update = (id: string, patch: Partial<Omit<Expense, "id">>) => {
    setExpenses((prev) => (prev ?? []).map((x) => (x.id === id ? { ...x, ...patch } : x)));
    api.patch(`/api/expenses/${id}`, patch).catch(() => load());
  };

  const remove = (id: string) => {
    setExpenses((prev) => (prev ?? []).filter((x) => x.id !== id));
    api.del(`/api/expenses/${id}`).catch(() => load());
  };

  return { expenses, add, update, remove };
}
