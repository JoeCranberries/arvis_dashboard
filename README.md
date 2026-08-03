# Arvi's Dashboard — Household Expenses

A personal household-finance dashboard — Next.js 16 (App Router) + React 19 +
TypeScript + Tailwind CSS v4, with a token-driven **dark / light** theme and a
**MongoDB** backend.

## Setup

This app needs a MongoDB connection. See **[SETUP-MONGODB.md](./SETUP-MONGODB.md)**
for step-by-step Atlas instructions. In short:

```bash
cp .env.local.example .env.local   # then paste your MONGODB_URI
npm run dev                        # http://localhost:3000
```

## Run

```bash
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve production build
```

## Pages

| Route         | What it does |
|---------------|--------------|
| `/`           | Overview — totals, spending-per-day chart, category breakdown, recent expenses |
| `/expenses`   | Household expenses grouped by day, per-day subtotals, colored category dropdowns |
| `/categories` | Add / edit / delete categories (cascades to expenses) |
| `/income`     | Income entries + Saldo (balance) + running-balance cash-flow ledger |
| `/settings`   | Dashboard name/badge, theme, and data backup (export / import / reset) |

## Architecture

```
src/
  app/
    api/            MongoDB-backed CRUD route handlers
      expenses/  income/  categories/  settings/
    page.tsx        Overview
    expenses/  categories/  income/  settings/
    layout.tsx      ThemeProvider + SettingsProvider + Shell
    globals.css     Theme tokens (.dash.dark / .dash.light) + component classes
  components/       Shell, Nav, Brand, ThemeProvider, ThemeToggle, SettingsProvider, ui
  hooks/            useExpenses, useIncome, useCategories (fetch the API, optimistic)
  lib/
    mongodb.ts      cached getDb() connection helper
    api.ts          tiny fetch wrapper
    expenses.ts     types, default categories, formatters
    income.ts       income type
```

Data flows: **component → hook → `/api/*` route → `getDb()` → MongoDB**. The hooks
apply optimistic updates and reload on error, so the UI stays snappy.

## Theming

Colors come from CSS variables on the `.dash` root in `globals.css` (`--a-bg`,
`--a-text`, `--a-panel`, …). The theme toggle swaps the `dark`/`light` class and
everything updates at once. Components use `text-[var(--a-text)]` and the
`.a-panel` / `.a-btn-primary` helpers.
