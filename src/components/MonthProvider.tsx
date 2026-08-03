"use client";

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";

const currentMonth = () => new Date().toISOString().slice(0, 7);

type Ctx = {
  month: string; // YYYY-MM
  setMonth: (m: string) => void;
  months: string[]; // months that have data
};

const MonthContext = createContext<Ctx>({
  month: currentMonth(),
  setMonth: () => {},
  months: [],
});

export const useMonth = () => useContext(MonthContext);

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function MonthProvider({ children }: { children: ReactNode }) {
  const [month, setMonth] = useState<string>(currentMonth());
  const [months, setMonths] = useState<string[]>([]);
  const autoPicked = useRef(false);

  useEffect(() => {
    fetch("/api/months", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((list: string[]) => {
        if (!Array.isArray(list)) return;
        setMonths(list);
        // On first load, if the current month has no data, jump to the latest month that does.
        if (!autoPicked.current) {
          autoPicked.current = true;
          const cur = currentMonth();
          if (list.length && !list.includes(cur)) setMonth(list[list.length - 1]);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <MonthContext.Provider value={{ month, setMonth, months }}>{children}</MonthContext.Provider>
  );
}
