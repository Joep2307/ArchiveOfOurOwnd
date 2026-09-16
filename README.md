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

- It reads `archiveofourown.org/users/<you>/readings`, one page at a
  time, with a 1.5 second pause between pages. If AO3 says “slow
  down”, it waits and tries again.
- A big history (say 3,000 works = 150 pages) takes about 4 minutes.
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
   `pnpm preview`
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
