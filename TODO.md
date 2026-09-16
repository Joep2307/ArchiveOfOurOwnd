# TODO

## Goal

A browser extension (Chrome + Firefox, Manifest V3) that reads the
logged-in user's AO3 reading history (`/users/<name>/readings`), stores
it locally in the browser, and opens a full-page dashboard with
statistics: totals, averages and medians, distributions, top lists
(authors, fandoms, ships, characters, tags), a sortable list of every
work, filters that apply to everything, and JSON/CSV export. Nothing
leaves the browser. Built with TypeScript, modular SCSS, Vite, Vitest,
and a small Rust/wasm crate for the number crunching.

## Phases

### 1. Scaffold

- [x] `TODO.md`
- [x] `package.json`, strict `tsconfig.json`, `.editorconfig`
- [x] ESLint (flat, typescript-eslint strict), Prettier, Stylelint
- [x] `.vscode/settings.json`, `.vscode/extensions.json`
- [x] `vitest.config.ts`, `tests/smoke.test.ts`
- [x] CI workflow, simple-git-hooks + lint-staged
- [x] Build script that outputs `dist/chrome` and `dist/firefox`
- [x] Manifest generator per browser (`src/manifest`)

### 2. Data model + parsing

- [x] `Work` type: title, authors, fandoms, rating, categories,
      warnings, ships, characters, tags, language, words, chapters,
      status, kudos/comments/bookmarks/hits, series, dates, visits
- [x] Parse one history blurb (normal, deleted, mystery, anonymous)
- [x] Parse AO3 dates: `12 Jan 2024` and relative (`3 days`)
- [x] Detect username from the AO3 header, detect last page
- [x] Fixture-based tests for the parser

### 3. Sync

- [x] Dashboard page reads the history pages directly with the
      user's AO3 cookies (host permission), no content script needed
- [x] Polite rate limit (delay between pages, back-off on 429/5xx)
- [x] Timers run in a Web Worker so background tabs keep the pace
- [x] Incremental sync: stop once pages are unchanged; full re-sync
      option in the menu
- [x] Progress in the UI, checkpoint saves every 20 pages, Stop button

### 4. Stats engine

- [x] Rust crate `stats-core`: summary (mean, median, percentiles,
      std dev) and histogram, one coarse wasm call each
- [x] TS wrapper that initialises wasm once
- [x] Aggregations: totals, count-by, top-N with words, monthly
      timeline, published-year, filters

### 5. Dashboard UI

- [x] Header with sync button, progress, last-synced time
- [x] Filter bar (search, fandom, author, tag, rating, status,
      period) — clicking any list item filters by it
- [x] Overview stat tiles
- [x] Charts: timeline, ratings, categories, word-count buckets,
      status, published year, languages
- [x] Top lists + most-revisited / longest / most-kudos works
- [x] Sortable, searchable, paginated works table
- [x] Export JSON/CSV, import JSON, clear data
- [x] Light + dark theme from tokens
- [x] Demo data mode so the dashboard can be previewed without AO3

### 6. Verify + ship

- [x] typecheck, lint, tests green
- [x] Build both targets, load in headless Chromium, screenshot
- [x] Load the real extension in Chromium and sync against a fake AO3
- [x] README with step-by-step install

## Open questions

- AO3 only stores the _last_ visit date and a visit count per work,
  not every visit. The timeline is "works by month last opened" and
  says so in the UI.
- Words read is an estimate: the current word count of each work,
  counted once, regardless of how much of it was read.

## Out of scope

- Testing in a real Firefox and against the live AO3 site (do this
  on your own machine, see README)

- "Marked for Later" list (easy follow-up: same parser, `show=to-read`)
- Publishing to the Chrome Web Store / Firefox Add-ons
- Syncing between devices
