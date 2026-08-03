"use client";

import { useCallback, useEffect, useState } from "react";
import { Income } from "@/lib/income";
import { api } from "@/lib/api";

/** Pass a month (YYYY-MM) to load only that month; omit to load everything. */
export function useIncome(month?: string) {
  const [income, setIncome] = useState<Income[] | null>(null);

  const load = useCallback(async () => {
    setIncome(null);
    try {
      const q = month ? `?month=${month}` : "";
      setIncome(await api.get(`/api/income${q}`));
    } catch {
      setIncome([]);
    }
  }, [month]);

  useEffect(() => {
    load();
  }, [load]);

  const inMonth = (date: string) => !month || date.startsWith(month);

  const add = (e: Omit<Income, "id">) => {
    const doc: Income = { ...e, id: crypto.randomUUID() };
    if (inMonth(e.date)) setIncome((prev) => [...(prev ?? []), doc]);
    api.post("/api/income", doc).catch(() => load());
  };

  const update = (id: string, patch: Partial<Omit<Income, "id">>) => {
    setIncome((prev) => (prev ?? []).map((x) => (x.id === id ? { ...x, ...patch } : x)));
    api.patch(`/api/income/${id}`, patch).catch(() => load());
  };

  const remove = (id: string) => {
    setIncome((prev) => (prev ?? []).filter((x) => x.id !== id));
    api.del(`/api/income/${id}`).catch(() => load());
  };

  return { income, add, update, remove };
}
