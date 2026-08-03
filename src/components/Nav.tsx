"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaChartPie, FaScaleBalanced, FaGear, FaWallet, FaTags } from "react-icons/fa6";

const items = [
  { href: "/", label: "Overview", icon: FaChartPie },
  { href: "/expenses", label: "Expenses", icon: FaWallet },
  { href: "/categories", label: "Categories", icon: FaTags },
  { href: "/income", label: "Income", icon: FaScaleBalanced },
  { href: "/settings", label: "Settings", icon: FaGear },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex shrink-0 items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-[var(--a-chip-hover)] text-[var(--a-text)]"
                : "text-[var(--a-muted)] hover:bg-[var(--a-chip)] hover:text-[var(--a-text)]"
            }`}
          >
            <Icon className="text-[15px]" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
