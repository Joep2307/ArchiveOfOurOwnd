# Reading Stats for AO3 (unofficial)

A browser extension for Chrome and Firefox that turns your
[Archive of Our Own](https://archiveofourown.org) **History** into
statistics: works and words read, reading time, authors, fandoms,
ships, characters, tags, series, ratings, lengths, averages and
medians, a timeline, standout works and a sortable list of everything.
Click any bar or list row to filter the whole page.

Everything stays in your browser. The extension only talks to
archiveofourown.org, with your own login, to read your History pages.

> Not affiliated with AO3 or the Organization for Transformative Works.

## What you need first

- You are logged in to archiveofourown.org in the browser you use.
- History is on: AO3 → your name → Preferences → “Turn on History”.

## Install in Chrome (also Edge, Brave, Arc)

The ready-built extension is in the `dist/chrome` folder.

1. Open a new tab and go to `chrome://extensions`.
2. Switch on **Developer mode** (top right).
3. Click **Load unpacked**.
4. Choose the `dist/chrome` folder inside this project.
5. Click the puzzle icon in the toolbar and pin **Reading Stats**.
6. Click the icon. The dashboard opens. Press **Sync my history**.

## Install in Firefox

Firefox only keeps unsigned extensions until you restart it, so this
is for trying it out. (For permanent use it has to be signed through
addons.mozilla.org.)

1. Go to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…**.
3. Pick the `manifest.json` file inside `dist/firefox`.
4. Click the extension icon, then **Sync my history**.
5. When Firefox asks for access to archiveofourown.org, allow it.

## How syncing works

- Opening the extension dashboard automatically starts an incremental sync.
  Saved statistics stay visible while it runs. Demo previews do not sync.
  If you are logged out or access is missing, the dashboard shows an error;
  log in or grant access, then use **Sync now** to retry.

- It reads `archiveofourown.org/users/<you>/readings`, one page at a
  time, with a 3 second pause between pages. If AO3 says “slow
  down”, it waits, tries again, and keeps a slower pace for the rest
  of that sync.
- A big history (say 3,000 works = 150 pages) takes about 8 minutes.
  You can switch tabs, but keep the dashboard tab open.
- The next sync only reads pages until it reaches works it already
  knows. Use **Options → Full re-sync** to refresh everything (for
  example updated kudos counts, or after you deleted History items).
- AO3 only remembers the **last** time you opened each work and how
  many times. The timeline groups works by that last visit.
- “Words read” is the current length of each work, counted once.

## On AO3 itself

While you browse archiveofourown.org, works that are in your synced
History get a green bar and a small **Read** badge (hover it for the
last visit date and number of visits). Links to read works in
descriptions and notes turn green. A work you open is marked right
away, even before the next sync.

AO3's top menu gets a **Reading stats** link that opens the dashboard
(it says **Sync reading stats** until you have synced once). Switch
the highlighting off under **Options → Highlight read works on AO3**.

**Options** menu: full re-sync, export JSON (a backup), export CSV (the
currently filtered works, opens in Excel/Numbers), import JSON, demo
data, theme, highlighting on AO3, and delete the stored history.

## Working on the code

You need [Node.js 22+](https://nodejs.org) and pnpm. Step by step, in
Terminal, from this folder:

1. Install pnpm once: `npm install -g pnpm`
2. Install the project's tools: `pnpm install`
3. Rebuild the extension after changes: `pnpm build:ext`
4. Or rebuild automatically on every save: `pnpm dev`
   (then press the reload ↻ button on `chrome://extensions`)
5. Design without the extension, with demo data, in a normal tab:
   `pnpm preview`, then open `http://127.0.0.1:5173/dashboard.html?demo`
   yourself. It updates the same dashboard as you edit the source files.
   The command never opens browser windows, and refuses to start another
   server if port 5173 is already in use.
6. Run the checks: `pnpm typecheck`, `pnpm lint`, `pnpm test`
7. Make zip files for sharing: `pnpm build:ext && pnpm zip`

### The Rust part

Averages, medians, percentiles and word-count buckets are computed by
a small Rust library (`crates/stats-core`) compiled to WebAssembly.
The compiled result is already in `src/wasm/stats-core`, so you only
need Rust if you change that crate:

1. Install Rust: https://rustup.rs
2. `rustup target add wasm32-unknown-unknown`
3. `cargo install wasm-pack`
4. `pnpm build` (builds the wasm, then the extension)
5. `cargo test --manifest-path crates/stats-core/Cargo.toml`

### Project layout

```
src/
  exe/          entry points: dashboard.html/ts, background.ts,
                content.ts (runs on AO3 pages)
  content/      highlights read works on AO3, adds the header link
  dashboard/    boots the page (browser APIs, wasm, storage)
  app/          state, sorting, all user actions
  ui/           everything you see; ui/charts for bars and columns
  styles/       SCSS: abstracts (tokens), base, layout, components
  parse/        reads AO3 History HTML into Work objects
  sync/         pages through History politely, merges results
  stats/        filters, counts, timeline, wasm wrapper
  storage/      storage.local helpers
  export/       CSV/JSON export and import
  demo/         fictional demo history
  manifest/     manifest.json for Chrome and Firefox
  model/        data types
  wasm/         generated from crates/stats-core (don't edit)
crates/stats-core/   Rust statistics
tests/          smoke test, fixtures
scripts/        build, zip, preview
```

`TODO.md` has the plan and what is done.

## Review your reading history

After a successful sync, a **Review reading history** popup combines your ten
longest visible works with your ten most-visited works (more than one visit),
without duplicates. The selection is independent of search and chart filters.
It opens automatically only when that selection has unreviewed works. Once
reviewed, later syncs stay quiet unless new unreviewed works enter the selection.
Choose **Read once**, **Read multiple times**, **Not read**, or **Not sure**.
**Read once** saves one full read immediately. **Read multiple times** reveals
a count field (minimum two); press **Save read count** to finish that answer.
Answers save locally,
survive re-syncs, and travel with JSON backups. Each answered work leaves the
queue when you close the popup and stays out on reopening. Answers are saved
immediately and remain visible for corrections until closing.
Open **Reviewed works** to edit
full-read counts or **Undo review**. The queue does not refill after each answer.
Close it with **Done / close** or Escape, and reopen it from
**Options → Review reading history**. Demo answers do not change saved history.

Confirmed words use the word count shown when you reviewed the work; later
updates do not increase that confirmation. Partial reads remain unquantified.
Dashboard statistics update immediately: not-read works are excluded, full
reads use their saved word-count snapshot multiplied by the confirmed count,
and unreviewed or uncertain works remain estimates. Average lengths count each
work once; confirmed rereads never use AO3 visit counts. The All works table
and AO3 visit totals retain the imported history. Undo restores the estimate.

**Not read** is not permanent: if a later sync detects an increased AO3 visit
count or a clearly later visit date, that answer clears and the work returns
to estimated reading statistics. It can be reviewed again if it belongs to
the longest/most-visited selection. A new visit does not confirm completion.

For multiple reads, the count includes the first read and is independent of
AO3 visits. Other answers do not show or require a count.
Confirmed words include these full rereads. Editing the count preserves the
original reviewed word count, even if the work has since grown.

Review cards have a collapsed **Show story summary** option and an
**Open on AO3** link that opens the story in a new tab.
