// ===== Household expenses model =====

export const EXPENSES_KEY = "dash-expenses";
export const CATEGORIES_KEY = "dash-categories";

export type Category = { name: string; bg: string; fg: string };

// Default palette (matches the reference sheet). Users can add/edit/delete these.
export const DEFAULT_CATEGORIES: Category[] = [
  { name: "House Hold", bg: "#e6e6e6", fg: "#4b5563" },
  { name: "Breakfast", bg: "#fce8a6", fg: "#8a6d1a" },
  { name: "Lunch", bg: "#e7d6f7", fg: "#6b3fa0" },
  { name: "Dinner", bg: "#f8cfa8", fg: "#a4531a" },
  { name: "Snack", bg: "#cde9c8", fg: "#3f7d3a" },
  { name: "Groceries", bg: "#8b0000", fg: "#ffffff" },
  { name: "Cookware-Utensils", bg: "#bcdada", fg: "#2f6b6b" },
  { name: "Wife needs", bg: "#f4b0a6", fg: "#a83f2f" },
  { name: "Travel", bg: "#1e7d4f", fg: "#ffffff" },
  { name: "Health", bg: "#2f5fc0", fg: "#ffffff" },
  { name: "Husband needs", bg: "#7b3f9e", fg: "#ffffff" },
];

export type Expense = {
  id: string;
  date: string; // ISO yyyy-mm-dd
  item: string;
  price: number; // Rupiah
  category: string; // references Category.name
};

// Seed data taken from the reference sheet.
export const SEED: Omit<Expense, "id">[] = [
  { date: "2026-06-06", item: "Sunlight", price: 13900, category: "House Hold" },
  { date: "2026-06-06", item: "Sabun mandi zen", price: 17900, category: "House Hold" },
  { date: "2026-06-06", item: "Pembalut", price: 15900, category: "House Hold" },
  { date: "2026-06-06", item: "Sikat gigi closeup 2 pcs", price: 19500, category: "House Hold" },
  { date: "2026-06-06", item: "Buavita 3 bh", price: 29100, category: "Groceries" },
  { date: "2026-06-07", item: "Kapas tipis", price: 13900, category: "House Hold" },
  { date: "2026-06-07", item: "Tissu nice bundling2", price: 23000, category: "House Hold" },
  { date: "2026-06-07", item: "Parfum pucelle", price: 37800, category: "House Hold" },
  { date: "2026-06-07", item: "Kispray 2 pcs", price: 11000, category: "House Hold" },
  { date: "2026-06-07", item: "Lotion marina", price: 9900, category: "House Hold" },
  { date: "2026-06-08", item: "Nasi uduk", price: 21000, category: "Breakfast" },
  { date: "2026-06-08", item: "Nasi goreng", price: 40000, category: "Dinner" },
  { date: "2026-06-09", item: "Nasi kuning", price: 20000, category: "Breakfast" },
  { date: "2026-06-09", item: "Ayam cabe hijau", price: 15000, category: "Dinner" },
  { date: "2026-06-09", item: "Kelapa muda", price: 17000, category: "Snack" },
  { date: "2026-06-10", item: "Lontong gulai", price: 28000, category: "Breakfast" },
  { date: "2026-06-10", item: "Timun 4bh", price: 6000, category: "Groceries" },
  { date: "2026-06-10", item: "Masker Med 2box", price: 71898, category: "House Hold" },
  { date: "2026-06-10", item: "Linen Spray Oscilla Legian 250ml", price: 46900, category: "House Hold" },
  { date: "2026-06-10", item: "Box stainless S 5box", price: 50031, category: "Cookware-Utensils" },
  { date: "2026-06-10", item: "Hanger miniso 20 pcs", price: 46620, category: "House Hold" },
];

// ----- helpers -----

export const NEUTRAL_STYLE: Omit<Category, "name"> = { bg: "#e5e7eb", fg: "#374151" };

/** Look up a category's colors by name, with a neutral fallback. */
export function styleFor(categories: Category[], name: string): Category {
  return categories.find((c) => c.name === name) ?? { name, ...NEUTRAL_STYLE };
}

/** Choose a readable text color (dark/light) for a given background. */
export function pickFg(bg: string): string {
  const h = bg.replace("#", "");
  if (h.length < 6) return "#1f2937";
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? "#1f2937" : "#ffffff";
}

const idr = new Intl.NumberFormat("id-ID");
export const formatIDR = (n: number) => "Rp " + idr.format(Math.round(n));

const dayDateFmt = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
export const formatDayDate = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  return isNaN(d.getTime()) ? iso : dayDateFmt.format(d);
};

const shortFmt = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" });
export const formatShortDate = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  return isNaN(d.getTime()) ? iso : shortFmt.format(d);
};
