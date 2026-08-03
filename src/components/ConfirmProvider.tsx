"use client";

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";

type Opts = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

type Internal = Opts & { mode: "confirm" | "alert" };
type State = { opts: Internal; resolve: (v: boolean) => void } | null;

type Ctx = {
  confirm: (o: Opts) => Promise<boolean>;
  notify: (o: Opts) => Promise<void>;
};

const DialogContext = createContext<Ctx>({
  confirm: async () => false,
  notify: async () => {},
});

export const useDialog = () => useContext(DialogContext);

export default function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(null);

  const confirm = useCallback(
    (opts: Opts) =>
      new Promise<boolean>((resolve) => setState({ opts: { ...opts, mode: "confirm" }, resolve })),
    []
  );
  const notify = useCallback(
    (opts: Opts) =>
      new Promise<void>((resolve) =>
        setState({ opts: { ...opts, mode: "alert" }, resolve: () => resolve() })
      ),
    []
  );

  const close = useCallback(
    (val: boolean) => {
      setState((s) => {
        s?.resolve(val);
        return null;
      });
    },
    []
  );

  // Escape cancels, Enter confirms.
  useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(false);
      if (e.key === "Enter") close(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state, close]);

  return (
    <DialogContext.Provider value={{ confirm, notify }}>
      {children}
      {state && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => close(false)}
        >
          <div
            className="a-panel w-full max-w-sm p-6 shadow-2xl"
            style={{ animation: "dialogIn 0.18s ease-out both" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-[var(--a-text)]">{state.opts.title}</h3>
            {state.opts.message && (
              <p className="mt-1.5 text-sm text-[var(--a-muted)]">{state.opts.message}</p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              {state.opts.mode === "confirm" && (
                <button
                  onClick={() => close(false)}
                  className="a-chip rounded-lg px-4 py-2 text-sm"
                >
                  {state.opts.cancelLabel ?? "Batal"}
                </button>
              )}
              <button
                onClick={() => close(true)}
                autoFocus
                className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                  state.opts.danger
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "a-btn-primary"
                }`}
              >
                {state.opts.confirmLabel ?? "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}
