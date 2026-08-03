# MongoDB Setup

The dashboard stores expenses, income, categories, and settings in **MongoDB**.
Data is read/written through API routes under `/api/*`; the browser never talks to
the database directly.

## 1. Create a free MongoDB Atlas cluster

1. Go to <https://www.mongodb.com/atlas> and sign up (free).
2. **Build a Database** → choose the **M0 (Free)** tier → create the cluster.
3. **Database Access** → *Add New Database User* → create a username + password
   (write these down — you'll need them for the connection string).
4. **Network Access** → *Add IP Address* → `Allow access from anywhere`
   (`0.0.0.0/0`) for development, or add your own IP.
5. **Database → Connect → Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## 2. Add your connection string locally

In the project root, copy the example file and fill it in:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local`:

```
MONGODB_URI="mongodb+srv://YOUR_USER:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority"
MONGODB_DB="arvi_dashboard"
```

- Replace `YOUR_USER` / `YOUR_PASSWORD` with the database user you created.
- If your password has special characters (`@ : / ?`), URL-encode them.
- `.env.local` is git-ignored, so your secret stays on your machine.

## 3. Run

```bash
npm run dev
```

Open <http://localhost:3000>. On first load:

- **Categories** are seeded automatically with the default palette.
- **Expenses** and **Income** start empty — add your own.

The `arvi_dashboard` database and its collections are created automatically on the
first write.

## Collections

| Collection   | Shape |
|--------------|-------|
| `expenses`   | `{ id, date, item, price, category }` |
| `income`     | `{ id, date, source, amount }` |
| `categories` | `{ name, bg, fg }` |
| `settings`   | `{ key: "app", name, initials }` |

## Backup / restore

**Settings → Data**:
- **Ekspor Backup** downloads a JSON of every collection.
- **Impor** replaces all data from a backup file.
- **Reset Semua Data** clears expenses, income, and categories.

## Troubleshooting

- **`MONGODB_URI is not set`** → you haven't created `.env.local`, or the dev server
  was started before you added it. Stop it (`Ctrl+C`) and run `npm run dev` again.
- **Auth / timeout errors** → check the database username/password and that your IP
  is allowed under Atlas **Network Access**.
- Restart the dev server after any change to `.env.local` (env vars are read at boot).
