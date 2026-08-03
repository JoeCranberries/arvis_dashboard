import { ReactNode } from "react";
import Nav from "./Nav";
import ThemeToggle from "./ThemeToggle";
import Brand from "./Brand";

export default function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:flex-row md:gap-8 md:px-8 md:py-8">
      {/* Sidebar */}
      <aside className="md:w-60 md:shrink-0">
        <div className="mb-6 flex items-center justify-between gap-3 px-1">
          <Brand />
          <div className="md:hidden">
            <ThemeToggle />
          </div>
        </div>

        <Nav />

        <div className="mt-4 hidden md:block">
          <ThemeToggle />
        </div>
      </aside>

      {/* Content */}
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
