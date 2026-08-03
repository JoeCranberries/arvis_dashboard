import { ReactNode } from "react";

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`a-panel p-6 ${className}`}>{children}</div>;
}

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <Panel className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--a-muted)]">{label}</span>
        {icon && <span className="text-[var(--a-faint)]">{icon}</span>}
      </div>
      <span className="text-3xl font-semibold tracking-tight text-[var(--a-text)]">{value}</span>
      {hint && <span className="text-xs text-[var(--a-faint)]">{hint}</span>}
    </Panel>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--a-text)] sm:text-3xl">
        {title}
      </h1>
      {subtitle && <p className="mt-1.5 text-sm text-[var(--a-muted)]">{subtitle}</p>}
    </div>
  );
}

/** Small status pill used in tables. */
export function Badge({ tone, children }: { tone: "green" | "amber" | "zinc"; children: ReactNode }) {
  const tones = {
    green: "bg-emerald-500/15 text-emerald-500",
    amber: "bg-amber-500/15 text-amber-500",
    zinc: "bg-[var(--a-chip)] text-[var(--a-muted)]",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
