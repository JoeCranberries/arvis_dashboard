"use client";

import { useCallback, useEffect, useState } from "react";
import { Category, pickFg } from "@/lib/expenses";
import { api } from "@/lib/api";

export function useCategories() {
  const [categories, setCategories] = useState<Category[] | null>(null);

  const load = useCallback(async () => {
    try {
      setCategories(await api.get("/api/categories"));
    } catch {
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const list = categories ?? [];

  const exists = (name: string) =>
    list.some((c) => c.name.toLowerCase() === name.trim().toLowerCase());

  const add = (name: string, bg: string) => {
    const n = name.trim();
    if (!n || exists(n)) return false;
    const doc: Category = { name: n, bg, fg: pickFg(bg) };
    setCategories((prev) => [...(prev ?? []), doc]);
    api.post("/api/categories", doc).catch(() => load());
    return true;
  };

  const update = (oldName: string, name: string, bg: string) => {
    const n = name.trim();
    if (!n) return false;
    if (n.toLowerCase() !== oldName.toLowerCase() && exists(n)) return false;
    const doc: Category = { name: n, bg, fg: pickFg(bg) };
    setCategories((prev) => (prev ?? []).map((c) => (c.name === oldName ? doc : c)));
    api.put(`/api/categories/${encodeURIComponent(oldName)}`, doc).catch(() => load());
    return true;
  };

  const remove = (name: string) => {
    setCategories((prev) => (prev ?? []).filter((c) => c.name !== name));
    api.del(`/api/categories/${encodeURIComponent(name)}`).catch(() => load());
  };

  const reset = () => {
    // Clear all, then reload — the API re-seeds defaults when the collection is empty.
    api
      .del("/api/categories")
      .then(() => load())
      .catch(() => load());
  };

  return { categories, list, loaded: categories !== null, add, update, remove, reset };
}
