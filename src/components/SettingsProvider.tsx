"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/api";

type Settings = { name: string; initials: string };
const DEFAULT: Settings = { name: "Arvi's", initials: "AV" };

type Ctx = Settings & {
  setName: (name: string) => void;
  setInitials: (initials: string) => void;
};

const SettingsContext = createContext<Ctx>({
  ...DEFAULT,
  setName: () => {},
  setInitials: () => {},
});

export const useSettings = () => useContext(SettingsContext);

export default function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT);

  useEffect(() => {
    api
      .get("/api/settings")
      .then((s) => {
        if (s && typeof s.name === "string") setSettings({ name: s.name, initials: s.initials });
      })
      .catch(() => {});
  }, []);

  const persist = (next: Settings) => {
    setSettings(next);
    api.put("/api/settings", next).catch(() => {});
  };

  const setName = (name: string) => persist({ ...settings, name });
  const setInitials = (initials: string) => persist({ ...settings, initials: initials.slice(0, 3) });

  return (
    <SettingsContext.Provider value={{ ...settings, setName, setInitials }}>
      {children}
    </SettingsContext.Provider>
  );
}
