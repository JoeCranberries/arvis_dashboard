"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FaPlus, FaPenToSquare, FaTrashCan, FaArrowLeft } from "react-icons/fa6";
import { PageHeader, Panel } from "@/components/ui";
import { useCategories } from "@/hooks/useCategories";
import { useExpenses } from "@/hooks/useExpenses";
import { useDialog } from "@/components/ConfirmProvider";
import { pickFg } from "@/lib/expenses";

export default function CategoriesPage() {
  const { list, loaded, add, update, remove } = useCategories();
  const { expenses, update: updateExpense } = useExpenses();
  const { confirm, notify } = useDialog();

  const [showForm, setShowForm] = useState(false);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", color: "#94a3b8" });

  // How many expenses use each category.
  const usage = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of expenses ?? []) m.set(e.category, (m.get(e.category) ?? 0) + 1);
    return m;
  }, [expenses]);

  const openAdd = () => {
    setForm({ name: "", color: "#94a3b8" });
    setEditingName(null);
    setShowForm(true);
  };
  const openEdit = (name: string, bg: string) => {
    setForm({ name, color: bg });
    setEditingName(name);
    setShowForm(true);
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const name = form.name.trim();
    if (!name) return;
    if (editingName) {
      const ok = update(editingName, name, form.color);
      if (!ok) {
        await notify({ title: "Tidak bisa disimpan", message: "Nama kategori sudah dipakai." });
        return;
      }
      // Cascade rename to any expenses that used the old name.
      if (name !== editingName) {
        (expenses ?? [])
          .filter((e) => e.category === editingName)
          .forEach((e) => updateExpense(e.id, { category: name }));
      }
    } else {
      const ok = add(name, form.color);
      if (!ok) {
        await notify({ title: "Tidak bisa ditambah", message: "Nama kategori sudah dipakai." });
        return;
      }
    }
    setShowForm(false);
    setEditingName(null);
  };

  const del = async (name: string) => {
    if (list.length <= 1) {
      await notify({ title: "Tidak bisa dihapus", message: "Minimal harus ada satu kategori." });
      return;
    }
    const count = usage.get(name) ?? 0;
    if (count > 0) {
      const to = list.find((c) => c.name !== name)!.name;
      const ok = await confirm({
        title: `Hapus kategori "${name}"?`,
        message: `${count} item memakai kategori ini dan akan dipindahkan ke "${to}".`,
        confirmLabel: "Hapus & pindahkan",
        danger: true,
      });
      if (!ok) return;
      (expenses ?? [])
        .filter((e) => e.category === name)
        .forEach((e) => updateExpense(e.id, { category: to }));
    } else {
      const ok = await confirm({
        title: `Hapus kategori "${name}"?`,
        confirmLabel: "Hapus",
        danger: true,
      });
      if (!ok) return;
    }
    remove(name);
  };

  return (
    <>
      <PageHeader title="Categories" subtitle="Tambah, ubah, atau hapus kategori pengeluaran." />

      <div className="mb-4 flex items-center justify-between gap-3">
        <Link
          href="/expenses"
          className="a-chip flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
        >
          <FaArrowLeft className="text-xs" /> Ke Expenses
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={openAdd}
            className="a-btn-primary flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold"
          >
            <FaPlus className="text-xs" /> Tambah Kategori
          </button>
        </div>
      </div>

      {showForm && (
        <Panel className="mb-4">
          <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-[var(--a-faint)]">Nama kategori</span>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="mis. Transport"
                className="a-input px-3 py-2 text-sm"
                autoFocus
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-[var(--a-faint)]">Warna</span>
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="h-9 w-16 cursor-pointer rounded-md border border-[var(--a-border)] bg-transparent p-1"
              />
            </label>
            <div className="flex items-end">
              <span
                className="rounded-full px-3 py-1 text-xs font-medium"
                style={{ background: form.color, color: pickFg(form.color) }}
              >
                {form.name.trim() || "Preview"}
              </span>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="a-btn-primary rounded-lg px-4 py-2 text-sm font-semibold">
                {editingName ? "Simpan" : "Tambah"}
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
        {!loaded ? (
          <p className="py-16 text-center text-sm text-[var(--a-faint)]">Memuat…</p>
        ) : (
          <ul className="divide-y divide-[var(--a-border)]">
            {list.map((c) => (
              <li key={c.name} className="flex items-center gap-4 px-5 py-3">
                <span
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{ background: c.bg, color: c.fg }}
                >
                  {c.name}
                </span>
                <span className="text-xs text-[var(--a-faint)]">{usage.get(c.name) ?? 0} item</span>
                <div className="ml-auto flex items-center gap-1">
                  <button
                    onClick={() => openEdit(c.name, c.bg)}
                    className="a-chip rounded-md p-1.5"
                    aria-label={`Edit ${c.name}`}
                  >
                    <FaPenToSquare className="text-xs" />
                  </button>
                  <button
                    onClick={() => del(c.name)}
                    className="a-chip rounded-md p-1.5 text-red-500"
                    aria-label={`Hapus ${c.name}`}
                  >
                    <FaTrashCan className="text-xs" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
