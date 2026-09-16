import { parseLibraryFile, worksToCsv } from '@/export';
import { feedbackCandidates, runFeedbackScan } from '@/feedback';
import { plural } from '@/format';
import { hideRemoved, type Library } from '@/model';
import {
    clampWordsPerMinute,
    filterWorks,
    MAX_WORDS_PER_MINUTE,
    reviewCandidates,
    type Facet,
} from '@/stats';
import {
    clearLibrary,
    loadActiveLibrary,
    loadHighlightSetting,
    loadLibrary,
    loadWordsPerMinute,
    saveHighlightSetting,
    saveLibrary,
    saveWordsPerMinute,
} from '@/storage';
import { runSync, SyncError } from '@/sync';
import { MIN_SPEED_TEST_MS } from './constants';
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
    let reviewQueue = Promise.resolve();

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

    const shown = (library: Library | null): Library | null =>
        library && hideRemoved(library);

    /** Saves a new removed list and shows the result. */
    const saveRemoved = async (removed: string[]): Promise<void> => {
        if (!stored) {
            return;
        }
        stored = { ...stored, removed };
        await saveLibrary(deps.storage, stored);
        store.update({ library: shown(stored) });
    };

    const saveSpeed = async (value: number): Promise<void> => {
        const wordsPerMinute = clampWordsPerMinute(value);
        store.update({ wordsPerMinute });
        await saveWordsPerMinute(deps.storage, wordsPerMinute);
    };

    const visibleWorks = (): Library['works'] => {
        const { library, filter } = store.get();
        return library ? filterWorks(library.works, filter, deps.now()) : [];
    };

    return {
        setReviewOpen(reviewOpen) {
            store.update({
                reviewOpen,
                ...(!reviewOpen ? { reviewSessionAnswered: [] } : {}),
            });
        },

        reviewWork(key, status, readCount) {
            if (
                readCount !== undefined &&
                (!Number.isSafeInteger(readCount) || readCount < 1)
            ) {
                return Promise.resolve();
            }
            const saveReview = async (): Promise<void> => {
                const { demo, library, sync } = store.get();
                if (!library || sync.running) return;
                const base = demo ? library : stored;
                const work = base?.works.find((item) => item.key === key);
                if (!base || work?.kind !== 'work') return;
                const reviews = Object.fromEntries(
                    Object.entries(base.reviews ?? {}).filter(
                        ([id]) => id !== key,
                    ),
                );
                const previous = base.reviews?.[key];
                if (status !== null)
                    reviews[key] = {
                        status,
                        words:
                            readCount !== undefined &&
                            previous?.status === 'finished'
                                ? previous.words
                                : work.words,
                        ...(status === 'finished'
                            ? {
                                  readCount:
                                      readCount ??
                                      (previous?.status === 'finished'
                                          ? (previous.readCount ?? 1)
                                          : 1),
                              }
                            : {}),
                        reviewedAt: deps.now().toISOString(),
                    };
                const next = { ...base, reviews };
                try {
                    if (!demo) {
                        await saveLibrary(deps.storage, next);
                        stored = next;
                    }
                    store.update((state) => ({
                        library: shown(next),
                        reviewSessionAnswered:
                            state.reviewOpen && status
                                ? [
                                      ...new Set([
                                          ...state.reviewSessionAnswered,
                                          key,
                                      ]),
                                  ]
                                : state.reviewSessionAnswered,
                    }));
                } catch {
                    setSync({
                        error: {
                            code: 'unknown',
                            message:
                                'Could not save your review. ' +
                                'Please try again.',
                        },
                    });
                }
            };
            reviewQueue = reviewQueue.then(saveReview);
            return reviewQueue;
        },

        async load() {
            const [library, highlightOnAo3, wordsPerMinute] =
                await Promise.all([
                    loadActiveLibrary(deps.storage),
                    loadHighlightSetting(deps.storage),
                    loadWordsPerMinute(deps.storage),
                ]);
            stored = library;
            store.update({
                library: shown(library),
                demo: false,
                highlightOnAo3,
                wordsPerMinute,
            });
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
            store.update({
                demo: false,
                library: shown(stored),
                reviewOpen: false,
                reviewSessionAnswered: [],
            });
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
                    username: stored?.username,
                    now: deps.now,
                    ...(deps.delayMs === undefined
                        ? {}
                        : { delayMs: deps.delayMs }),
                    loadStored: (username) =>
                        loadLibrary(deps.storage, username),
                    save: async (partial) => {
                        await saveLibrary(deps.storage, partial);
                        stored = partial;
                        store.update({ library: shown(partial) });
                    },
                    onProgress: (progress) => {
                        setSync({ progress });
                    },
                });
                store.update({
                    reviewOpen: reviewCandidates(
                        shown(library)?.works ?? [],
                    ).some((work) => !library.reviews?.[work.key]),
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

        async checkFeedback() {
            const { sync, demo } = store.get();
            if (sync.running || demo || !stored) {
                return;
            }
            const works = feedbackCandidates(
                hideRemoved(stored).works,
                stored.feedback ?? {},
            );
            if (works.length === 0) {
                setSync({
                    error: null,
                    notice:
                        'Kudos and comments are up to date. Works you ' +
                        'open later are checked next time.',
                });
                return;
            }
            const granted = await deps.requestAccess();
            if (!granted) {
                setSync({
                    error: {
                        code: 'no-permission',
                        message:
                            'The extension needs permission to read ' +
                            'archiveofourown.org to check kudos and ' +
                            'comments.',
                    },
                });
                return;
            }
            abort = new AbortController();
            store.update({ reviewOpen: false, reviewSessionAnswered: [] });
            setSync({
                running: true,
                error: null,
                notice: null,
                progress: null,
            });
            const { username } = stored;
            try {
                await runFeedbackScan({
                    username,
                    works,
                    feedback: stored.feedback ?? {},
                    fetchText: deps.fetchText,
                    parseHtml: deps.parseHtml,
                    sleep: deps.sleep,
                    signal: abort.signal,
                    delayMs: deps.delayMs,
                    now: deps.now,
                    save: async (feedback) => {
                        if (stored?.username !== username) {
                            return;
                        }
                        const next = { ...stored, feedback };
                        await saveLibrary(deps.storage, next);
                        stored = next;
                        store.update({ library: shown(next) });
                    },
                    onProgress: (progress) => {
                        setSync({ progress });
                    },
                });
                setSync({
                    notice:
                        `Checked kudos and comments on ` +
                        `${plural(works.length, 'work')}.`,
                });
            } catch (error) {
                const known = error instanceof SyncError;
                if (known && error.code === 'aborted') {
                    setSync({
                        notice:
                            'Check stopped. What was found so far is ' +
                            'saved; the next check goes on from there.',
                    });
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
            store.update({
                demo: false,
                library: shown(stored),
                ...resetView(),
            });
        },

        exportJson() {
            // The stored copy still holds the removed works.
            const library = store.get().demo ? store.get().library : stored;
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
                store.update({
                    library: shown(library),
                    demo: false,
                    ...resetView(),
                });
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

        setSort(sort, descending) {
            store.update({ table: { sort, descending, page: 0 } });
        },

        setPage(page) {
            store.update((state) => ({
                table: { ...state.table, page },
            }));
        },

        showView(view) {
            store.update({ view });
        },

        toggleExpanded(id) {
            store.update((state) => ({
                expanded: { ...state.expanded, [id]: !state.expanded[id] },
            }));
        },

        setRankBy(rankBy) {
            store.update({ rankBy });
        },

        setLengthOrder(lengthOrder) {
            store.update({ lengthOrder });
        },

        async removeWork(work) {
            const { library, demo, sync } = store.get();
            if (!library || sync.running) {
                return;
            }
            const notice = `Removed “${work.title}”.`;
            if (demo) {
                store.update({
                    library: {
                        ...library,
                        works: library.works.filter((w) => w.key !== work.key),
                    },
                });
            } else {
                const removed = stored?.removed ?? [];
                if (removed.includes(work.key)) {
                    return;
                }
                await saveRemoved([...removed, work.key]);
            }
            setSync({
                error: null,
                notice: demo
                    ? notice
                    : `${notice} Options → Restore removed works ` +
                      'brings it back.',
            });
        },

        async restoreRemoved() {
            const count = stored?.removed?.length ?? 0;
            if (count === 0 || store.get().sync.running) {
                return;
            }
            await saveRemoved([]);
            setSync({
                error: null,
                notice: `Restored ${plural(count, 'removed work')}.`,
            });
        },

        setTheme(theme) {
            store.update({ theme });
        },

        async setHighlightOnAo3(highlightOnAo3) {
            store.update({ highlightOnAo3 });
            await saveHighlightSetting(deps.storage, highlightOnAo3);
        },

        setWordsPerMinute: saveSpeed,

        startSpeedTest() {
            store.update({
                speedTest: {
                    startedAt: deps.now().getTime(),
                    result: null,
                    tooFast: false,
                },
            });
        },

        async finishSpeedTest(words) {
            const { startedAt } = store.get().speedTest;
            if (startedAt === null) {
                return;
            }
            const elapsed = deps.now().getTime() - startedAt;
            const measured = (words * 60_000) / Math.max(1, elapsed);
            const tooFast =
                elapsed < MIN_SPEED_TEST_MS || measured > MAX_WORDS_PER_MINUTE;
            const result = tooFast ? null : clampWordsPerMinute(measured);
            store.update({
                speedTest: { startedAt: null, result, tooFast },
            });
            if (result !== null) {
                await saveSpeed(result);
            }
        },

        resetSpeedTest() {
            store.update({
                speedTest: { startedAt: null, result: null, tooFast: false },
            });
        },

        dismissMessage() {
            setSync({ error: null, notice: null });
        },
    };
}
