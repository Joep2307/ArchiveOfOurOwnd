import { parseLibraryFile, worksToCsv } from '@/export';
import type { Library } from '@/model';
import { filterWorks, type Facet } from '@/stats';
import {
    clearLibrary,
    loadActiveLibrary,
    loadLibrary,
    saveLibrary,
} from '@/storage';
import { runSync, SyncError } from '@/sync';
import type { DashboardController } from './DashboardController';
import type { DashboardDeps } from './DashboardDeps';
import type { DashboardState } from './DashboardState';
import type { Store } from './Store';

const SAME_FACET =
    (a: Facet) =>
    (b: Facet): boolean =>
        a.field === b.field && a.value === b.value;

function fileStamp(date: Date): string {
    return date.toISOString().slice(0, 10);
}

/** All user actions of the dashboard. */
export function createDashboardController(
    store: Store<DashboardState>,
    deps: DashboardDeps,
): DashboardController {
    let abort: AbortController | null = null;
    let stored: Library | null = null;

    const resetView = (): Partial<DashboardState> => ({
        table: { ...store.get().table, page: 0 },
    });

    const withFilter = (change: Partial<DashboardState['filter']>): void => {
        store.update((state) => ({
            filter: { ...state.filter, ...change },
            ...resetView(),
        }));
    };

    const setSync = (change: Partial<DashboardState['sync']>): void => {
        store.update((state) => ({
            sync: { ...state.sync, ...change },
        }));
    };

    const visibleWorks = (): Library['works'] => {
        const { library, filter } = store.get();
        return library ? filterWorks(library.works, filter, deps.now()) : [];
    };

    return {
        async load() {
            stored = await loadActiveLibrary(deps.storage);
            store.update({ library: stored, demo: false });
        },

        async sync(full) {
            if (store.get().sync.running) {
                return;
            }
            const granted = await deps.requestAccess();
            if (!granted) {
                setSync({
                    error: {
                        code: 'no-permission',
                        message:
                            'The extension needs permission to read ' +
                            'archiveofourown.org to sync.',
                    },
                });
                return;
            }
            abort = new AbortController();
            store.update({ demo: false, library: stored });
            setSync({
                running: true,
                error: null,
                notice: null,
                progress: null,
            });
            const before = stored?.works.length ?? 0;
            try {
                const library = await runSync({
                    fetchText: deps.fetchText,
                    parseHtml: deps.parseHtml,
                    sleep: deps.sleep,
                    signal: abort.signal,
                    full,
                    now: deps.now,
                    ...(deps.delayMs === undefined
                        ? {}
                        : { delayMs: deps.delayMs }),
                    loadStored: (username) =>
                        loadLibrary(deps.storage, username),
                    save: async (partial) => {
                        await saveLibrary(deps.storage, partial);
                        stored = partial;
                        store.update({ library: partial });
                    },
                    onProgress: (progress) => {
                        setSync({ progress });
                    },
                });
                const added = library.works.length - before;
                setSync({
                    notice:
                        added > 0
                            ? `Synced. ${added} new entries.`
                            : 'Synced. Your history is up to date.',
                });
            } catch (error) {
                const known = error instanceof SyncError;
                if (known && error.code === 'aborted') {
                    setSync({ notice: 'Sync stopped.' });
                } else {
                    setSync({
                        error: {
                            code: known ? error.code : 'unknown',
                            message:
                                error instanceof Error
                                    ? error.message
                                    : String(error),
                        },
                    });
                }
            } finally {
                abort = null;
                setSync({ running: false, progress: null });
            }
        },

        stopSync() {
            abort?.abort();
        },

        showDemo() {
            store.update({
                demo: true,
                library: deps.createDemo(),
                ...resetView(),
            });
        },

        hideDemo() {
            store.update({ demo: false, library: stored, ...resetView() });
        },

        exportJson() {
            const { library } = store.get();
            if (!library) {
                return;
            }
            deps.download(
                `ao3-history-${library.username}-` +
                    `${fileStamp(deps.now())}.json`,
                JSON.stringify(library, null, 2),
                'application/json',
            );
        },

        exportCsv() {
            const { library } = store.get();
            if (!library) {
                return;
            }
            deps.download(
                `ao3-history-${library.username}-` +
                    `${fileStamp(deps.now())}.csv`,
                worksToCsv(visibleWorks()),
                'text/csv',
            );
        },

        async importJson(text) {
            try {
                const library = parseLibraryFile(text);
                await saveLibrary(deps.storage, library);
                stored = library;
                store.update({ library, demo: false, ...resetView() });
                setSync({
                    error: null,
                    notice: `Imported ${library.works.length} entries.`,
                });
            } catch (error) {
                setSync({
                    error: {
                        code: 'unknown',
                        message:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    },
                });
            }
        },

        async clearData() {
            if (!stored) {
                return;
            }
            const ok = deps.confirm(
                `Delete the stored history of ${stored.username} ` +
                    'from this browser? Your AO3 account is not ' +
                    'affected.',
            );
            if (!ok) {
                return;
            }
            await clearLibrary(deps.storage, stored.username);
            stored = null;
            store.update({ library: null, demo: false, ...resetView() });
            setSync({ notice: 'Stored history deleted.', error: null });
        },

        setQuery(query) {
            withFilter({ query });
        },

        setPeriod(period) {
            withFilter({ period });
        },

        toggleFacet(facet) {
            const { facets } = store.get().filter;
            const exists = facets.some(SAME_FACET(facet));
            withFilter({
                facets: exists
                    ? facets.filter((f) => !SAME_FACET(facet)(f))
                    : [...facets, facet],
            });
        },

        removeFacet(facet) {
            const { facets } = store.get().filter;
            withFilter({
                facets: facets.filter((f) => !SAME_FACET(facet)(f)),
            });
        },

        clearFilters() {
            withFilter({ query: '', period: 'all', facets: [] });
        },

        sortBy(key) {
            store.update((state) => ({
                table: {
                    sort: key,
                    descending:
                        state.table.sort === key
                            ? !state.table.descending
                            : !['title', 'author', 'fandom'].includes(key),
                    page: 0,
                },
            }));
        },

        setPage(page) {
            store.update((state) => ({
                table: { ...state.table, page },
            }));
        },

        toggleExpanded(id) {
            store.update((state) => ({
                expanded: { ...state.expanded, [id]: !state.expanded[id] },
            }));
        },

        setRankBy(rankBy) {
            store.update({ rankBy });
        },

        setTheme(theme) {
            store.update({ theme });
        },

        dismissMessage() {
            setSync({ error: null, notice: null });
        },
    };
}
