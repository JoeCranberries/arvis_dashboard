"use client";

import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { useMonth, shiftMonth } from "./MonthProvider";

const label = (month: string) => {
  const [y, m] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(
    new Date(y, m - 1, 1)
  );
};

export default function MonthPicker() {
  const { month, setMonth } = useMonth();
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setMonth(shiftMonth(month, -1))}
        aria-label="Bulan sebelumnya"
        className="a-chip flex h-9 w-9 items-center justify-center rounded-lg"
      >
        <FaChevronLeft className="text-xs" />
      </button>
      <span className="min-w-36 text-center text-sm font-medium text-[var(--a-text)]">
        {label(month)}
      </span>
      <button
        onClick={() => setMonth(shiftMonth(month, 1))}
        aria-label="Bulan berikutnya"
        className="a-chip flex h-9 w-9 items-center justify-center rounded-lg"
      >
        <FaChevronRight className="text-xs" />
      </button>
    </div>
  );
}
