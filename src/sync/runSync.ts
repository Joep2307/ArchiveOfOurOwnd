import type { Library, Work } from '@/model';
import { createEmptyLibrary } from '@/model';
import { AO3_ORIGIN, parseReadingsPage, parseUsername } from '@/parse';
import { CHECKPOINT_EVERY, PAGE_DELAY_MS } from './constants';
import type { FetchText } from './FetchText';
import { fetchWithRetry } from './fetchWithRetry';
import { isPageUnchanged } from './isPageUnchanged';
import { mergeWorks } from './mergeWorks';
import { readingsUrl } from './readingsUrl';
import type { Sleep } from './Sleep';
import { SyncError } from './SyncError';
import type { SyncProgress } from './SyncProgress';

export type SyncOptions = {
    fetchText: FetchText;
    parseHtml: (html: string) => Document;
    sleep: Sleep;
    /** Loads what is stored for an account, if anything. */
    loadStored: (username: string) => Promise<Library | null>;
    /** Persists partial and final results. */
    save: (library: Library) => Promise<void>;
    /** Re-read every page instead of stopping at known ones. */
    full?: boolean;
    delayMs?: number;
    signal?: AbortSignal;
    now?: () => Date;
    onProgress?: (progress: SyncProgress) => void;
};

function isLoginPage(url: string): boolean {
    return url.includes('/users/login');
}

/**
 * Reads the AO3 history of the logged-in user, page by page, and
 * saves it. Returns the saved library.
 */
export async function runSync(options: SyncOptions): Promise<Library> {
    const {
        fetchText,
        parseHtml,
        sleep,
        loadStored,
        save,
        signal,
        full = false,
        delayMs = PAGE_DELAY_MS,
        now = (): Date => new Date(),
        onProgress = (): void => undefined,
    } = options;

    let page = 0;
    let lastPage: number | null = null;
    const fresh: Work[] = [];

    const retry = {
        fetchText,
        sleep,
        signal,
        onWait: (ms: number, status: number): void => {
            onProgress({
                phase: 'waiting',
                page,
                lastPage,
                worksSeen: fresh.length,
                message:
                    status === 429
                        ? `AO3 asked us to slow down. Waiting ` +
                          `${Math.round(ms / 1000)}s…`
                        : `AO3 did not answer. Retrying in ` +
                          `${Math.round(ms / 1000)}s…`,
            });
        },
    };

    onProgress({
        phase: 'login',
        page,
        lastPage,
        worksSeen: 0,
        message: 'Checking your AO3 login…',
    });
    const home = await fetchWithRetry(`${AO3_ORIGIN}/`, retry);
    const username = parseUsername(parseHtml(home.text));
    if (!username) {
        throw new SyncError(
            'logged-out',
            'You are not logged in to AO3 in this browser.',
        );
    }

    const stored = await loadStored(username);
    const base = stored ?? createEmptyLibrary(username);
    const storedByKey = new Map(
        base.works.map((work) => [work.key, work] as const),
    );
    const incremental = !full && base.works.length > 0;

    const snapshot = (complete: boolean): Library => ({
        ...base,
        syncedAt: complete ? now().toISOString() : base.syncedAt,
        works:
            complete && !incremental
                ? [...fresh]
                : mergeWorks(fresh, base.works),
    });

    for (page = 1; lastPage === null || page <= lastPage; page += 1) {
        if (page > 1) {
            await sleep(delayMs, signal);
        }
        onProgress({
            phase: 'page',
            page,
            lastPage,
            worksSeen: fresh.length,
            message: lastPage
                ? `Reading page ${page} of ${lastPage}…`
                : `Reading page ${page}…`,
        });

        const result = await fetchWithRetry(
            readingsUrl(username, page),
            retry,
        );
        if (isLoginPage(result.url)) {
            throw new SyncError(
                'logged-out',
                'AO3 logged you out during the sync.',
            );
        }
        const parsed = parseReadingsPage(parseHtml(result.text), now(), page);
        lastPage = Math.max(parsed.lastPage, page);

        if (parsed.works.length === 0) {
            break;
        }
        const unchanged =
            incremental && isPageUnchanged(parsed.works, storedByKey);
        fresh.push(...parsed.works);
        if (unchanged) {
            break;
        }
        if (page % CHECKPOINT_EVERY === 0) {
            await save(snapshot(false));
        }
    }

    onProgress({
        phase: 'saving',
        page,
        lastPage,
        worksSeen: fresh.length,
        message: 'Saving…',
    });
    const library = snapshot(true);
    await save(library);
    return library;
}
