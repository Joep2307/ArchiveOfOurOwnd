import type { Library, Work } from '@/model';
import { createEmptyLibrary } from '@/model';
import { AO3_ORIGIN, parseReadingsPage, parseUsername } from '@/parse';
import {
    CHECKPOINT_EVERY,
    MAX_PAGE_DELAY_MS,
    PAGE_DELAY_MS,
} from './constants';
import type { FetchTextResult } from './FetchTextResult';
import { fetchWithRetry } from './fetchWithRetry';
import { isPageUnchanged } from './isPageUnchanged';
import { mergeWorks } from './mergeWorks';
import { readingsUrl } from './readingsUrl';
import type { SyncOptions } from './SyncOptions';
import { SyncError } from './SyncError';

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
        username: knownUsername,
        full = false,
        delayMs = PAGE_DELAY_MS,
        now = (): Date => new Date(),
        onProgress = (): void => undefined,
    } = options;

    let page = 0;
    let lastPage: number | null = null;
    const fresh: Work[] = [];
    let pageDelay = delayMs;

    const retry = {
        fetchText,
        sleep,
        signal,
        onWait: (ms: number, status: number): void => {
            if (status === 429) {
                pageDelay = Math.min(pageDelay * 2, MAX_PAGE_DELAY_MS);
            }
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
    // Every AO3 page shows who is logged in, so page 1 of the last
    // synced account doubles as the login check.
    const home = (): Promise<FetchTextResult> =>
        fetchWithRetry(`${AO3_ORIGIN}/`, retry);
    const checked =
        knownUsername === undefined
            ? await home()
            : await fetchWithRetry(readingsUrl(knownUsername, 1), retry).catch(
                  (error: unknown) => {
                      // Another account's history may be refused outright.
                      if (
                          error instanceof SyncError &&
                          error.code === 'http'
                      ) {
                          return home();
                      }
                      throw error;
                  },
              );
    const username = isLoginPage(checked.url)
        ? null
        : parseUsername(parseHtml(checked.text));
    const firstPage =
        knownUsername !== undefined && username === knownUsername
            ? checked
            : null;
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
        const reuse = page === 1 ? firstPage : null;
        if (!reuse && (page > 1 || knownUsername !== undefined)) {
            await sleep(pageDelay, signal);
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

        const result =
            reuse ??
            (await fetchWithRetry(readingsUrl(username, page), retry));
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
