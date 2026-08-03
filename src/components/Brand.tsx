"use client";

import { useSettings } from "./SettingsProvider";

export default function Brand() {
  const { name, initials } = useSettings();
  return (
    <div className="flex items-center gap-3">
      <div className="a-btn-primary flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold">
        {initials}
      </div>
      <div className="leading-tight">
        <p className="text-sm font-semibold text-[var(--a-text)]">{name}</p>
        <p className="text-xs text-[var(--a-faint)]">Dashboard</p>
      </div>
    </div>
  );
}
