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

### 7. On AO3 itself: read works turn green + dashboard link

A content script that runs on `archiveofourown.org`, reads the stored
library (content scripts can use `storage.local` directly) and marks
every work you have in History. Also adds a button that opens the
dashboard.

**Build + manifest**

- [x] Entry point `src/exe/content.ts` (+ `src/content/` folder)
- [x] Build it as a separate classic script (IIFE, no `import`s):
      MV3 content scripts can't be ES modules. Second Vite build in
      `scripts/build.ts` → `dist/<target>/content.js` (+ `content.css`)
- [x] `createManifest`: add `content_scripts` with
      `matches: ["https://archiveofourown.org/*"]`, `js`, `css`,
      `run_at: "document_idle"`; update `createManifest.test.ts`
- [x] Firefox: check the host permission is granted before the script
      runs (MV3 host permissions are opt-in there). The script just
      doesn't run until access is granted; the dashboard's first sync
      already asks for it

**Finding read works**

- [x] Load the library for the logged-in user: `parseUsername(document)`
      → `loadLibrary`, fall back to `loadActiveLibrary`
- [x] Build a `Map<number, Work | null>` of work ids (skip
      `id === null`; `null` = opened since the last sync)
- [x] Find work blurbs on the page: `li.work.blurb`,
      `li.bookmark.blurb` (id from `/works/<id>` in `h4.heading a`),
      and work links in general (`a[href^="/works/"]`) for
      series pages, collections, etc.
- [x] Also mark the work page itself (`/works/<id>`,
      `/works/<id>/chapters/<n>`) with a small "read" badge
- [x] Pure helper `workIdFromHref(href): number | null` + tests
      (handles `/works/123`, `/works/123/chapters/456`,
      `/collections/x/works/123`, query strings, anchors)

**Styling**

- [x] Add a class `ao3rs-read` to each matched blurb; green left
      border + light green background in `src/styles/content.scss`,
      translucent so it works on AO3's light and dark skins
- [x] Optional: tooltip/badge with "Read · last visited <date> ·
      <n> visits" from the stored `Work`
- [x] Don't touch AO3's own layout: only add a class and a badge,
      prefix every class with `ao3rs-`

**Keeping it up to date**

- [x] `storage.onChanged` listener: re-mark the page after a sync
- [x] `MutationObserver` for content AO3 loads later (rare, but cheap)
- [x] Opening a work adds it to the set right away (optimistic), so
      it's green on the next listing without needing a sync

**Dashboard link**

- [x] Add a "Reading stats" link to AO3's header nav (next to the
      user menu)
- [x] Clicking it sends `runtime.sendMessage({ type: 'open-dashboard' })`;
      `startBackground` listens and calls `openDashboard` (web pages
      can't link to `chrome-extension://` URLs directly)
- [x] When no library is stored yet: the link says "Sync reading stats"

**Settings (dashboard Options menu)**

- [x] Toggle "Highlight read works on AO3" (stored in `storage.local`,
      content script checks it)
- [ ] Optional: pick highlight colour; option to hide read works
      instead of colouring them

**Verify**

- [x] Unit tests for `workIdFromHref` and the blurb marker (jsdom
      fixture of a search results page)
- [x] Headless Chromium against a fake AO3 page: read works get the
      class, others don't; header link opens the dashboard
- [ ] Manual check on the real site in Chrome and Firefox
- [x] README: explain the green highlight and the header link

### 8. Back end matches the project standards

- [x] One export per file: move `BootOptions`, `ReadingReview`,
      `Chapters`, `VisitInfo`, `CountOptions`, `StatsCoreBindings`,
      `FetchTextResult`, `RetryOptions` and `SyncOptions` into their
      own files
- [x] Cross-folder imports go through barrels (`@/model`, `@/stats`),
      export `ReadingReview` and `reviewCandidates` from them
- [x] Move the timer Web Worker entry point to `src/exe/`
- [x] Keep `package.json` within 79 columns (`build:wasm` script)
- [x] typecheck, lint, tests and build green

### 9. Pages instead of one long scroll

- [x] `view` in the dashboard state, kept in the URL hash (`#/genres`)
      so reload and the Back button work
- [x] Menu on the left switches pages and marks the open one
- [x] Start page is a dashboard: welcome, headline numbers,
      highlights (top genres, fandoms, most revisited) with links to
      their pages, and the timeline
- [x] Genres page: top genre tiles, ranked tag list, ratings,
      pairing categories, warnings, languages
- [x] Other pages: Over time, Length & status, Favourites,
      Standouts, All works
- [x] Smoke test opens the Genres and All works pages

### 10. Advanced settings: personal reading speed

- [x] Words per minute saved in storage (clamped 50–1500), used for
      the estimated reading time
- [x] Advanced page (`#/settings`, menu + Options) with the speed
      field and a reset to the 250 average
- [x] Built-in reading test: timed passage, rejects impossibly fast
      results, one click to use the measured speed
- [x] Controller tests; checked in headless Chromium

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
