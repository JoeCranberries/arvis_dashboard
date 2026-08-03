"use client";

import { useCallback, useEffect, useState } from "react";
import { Expense } from "@/lib/expenses";
import { api } from "@/lib/api";

/** Pass a month (YYYY-MM) to load only that month; omit to load everything. */
export function useExpenses(month?: string) {
  const [expenses, setExpenses] = useState<Expense[] | null>(null);

  const load = useCallback(async () => {
    setExpenses(null);
    try {
      const q = month ? `?month=${month}` : "";
      setExpenses(await api.get(`/api/expenses${q}`));
    } catch {
      setExpenses([]);
    }
  }, [month]);

  useEffect(() => {
    load();
  }, [load]);

  const inMonth = (date: string) => !month || date.startsWith(month);

  const add = (e: Omit<Expense, "id">) => {
    const doc: Expense = { ...e, id: crypto.randomUUID() };
    if (inMonth(e.date)) setExpenses((prev) => [...(prev ?? []), doc]);
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
