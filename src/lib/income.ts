export const INCOME_KEY = "dash-income";

export type Income = {
  id: string;
  date: string; // ISO yyyy-mm-dd
  source: string;
  amount: number; // Rupiah
};

export const INCOME_SEED: Omit<Income, "id">[] = [
  { date: "2026-06-01", source: "Gaji bulanan", amount: 4500000 },
  { date: "2026-06-15", source: "Freelance", amount: 750000 },
];
