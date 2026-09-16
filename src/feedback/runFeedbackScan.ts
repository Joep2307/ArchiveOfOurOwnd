import { formatDuration, plural } from '@/format';
import type { Work, WorkFeedback } from '@/model';
import { parseUsername } from '@/parse';
import {
    fetchWithRetry,
    MAX_PAGE_DELAY_MS,
    PAGE_DELAY_MS,
    SyncError,
    type FetchText,
    type FetchTextResult,
} from '@/sync';
import { commentsUrl } from './commentsUrl';
import { commentThreadUrl } from './commentThreadUrl';
import {
    FEEDBACK_CHECKPOINT_EVERY,
    MAX_THREAD_PAGES,
    SCRIPT_HEADERS,
} from './constants';
import type { FeedbackPage } from './FeedbackPage';
import type { FeedbackScanOptions } from './FeedbackScanOptions';
import { kudosUrl } from './kudosUrl';
import { parseCommentsPage } from './parseCommentsPage';
import { parseKudosPage } from './parseKudosPage';
import { unwrapCommentsScript } from './unwrapCommentsScript';

type Source = {
    url: (page: number) => string;
    script: boolean;
    parse: (doc: Document, username: string) => FeedbackPage;
};

/**
 * Looks up, work by work, whether `username` left kudos or a comment.
 * Pauses between requests like the history sync. Returns every
 * result, the earlier ones included.
 */
export async function runFeedbackScan(
    options: FeedbackScanOptions,
): Promise<Record<string, WorkFeedback>> {
    const {
        username,
        works,
        fetchText,
        parseHtml,
        sleep,
        save,
        signal,
        delayMs = PAGE_DELAY_MS,
        now = (): Date => new Date(),
        onProgress = (): void => undefined,
    } = options;
    const feedback: Record<string, WorkFeedback> = { ...options.feedback };
    let pageDelay = delayMs;
    let requests = 0;
    let index = 0;
    const found = { kudos: 0, commented: 0 };
    const add = (result: WorkFeedback | undefined, sign: number): void => {
        found.kudos += result?.kudos ? sign : 0;
        found.commented += result?.commented ? sign : 0;
    };
    for (const work of works) {
        add(feedback[work.key], 1);
    }

    const report = (
        phase: 'page' | 'waiting' | 'saving',
        message: string,
    ): void => {
        const perWork = index > 0 ? requests / index : 2;
        const left = (works.length - index) * perWork * pageDelay;
        onProgress({
            phase,
            page: index,
            lastPage: works.length,
            worksSeen: index,
            message,
            detail:
                `Found kudos on ${plural(found.kudos, 'work')} and ` +
                `comments on ${plural(found.commented, 'work')} so far. ` +
                `About ${formatDuration(left / 60_000)} left. You can ` +
                'switch tabs, but keep this one open.',
        });
    };

    const scriptFetch: FetchText = (url, abort) =>
        fetchText(url, abort, SCRIPT_HEADERS);

    /** A page as a document, or `null` when AO3 won't show it. */
    const load = async (
        url: string,
        script: boolean,
    ): Promise<Document | null> => {
        if (requests > 0) {
            await sleep(pageDelay, signal);
        }
        requests += 1;
        let result: FetchTextResult;
        try {
            result = await fetchWithRetry(url, {
                fetchText: script ? scriptFetch : fetchText,
                sleep,
                signal,
                onWait: (ms, status) => {
                    if (status === 429) {
                        pageDelay = Math.min(pageDelay * 2, MAX_PAGE_DELAY_MS);
                    }
                    report(
                        'waiting',
                        status === 429
                            ? `AO3 asked us to slow down. Waiting ` +
                                  `${Math.round(ms / 1000)}s…`
                            : `AO3 did not answer. Retrying in ` +
                                  `${Math.round(ms / 1000)}s…`,
                    );
                },
            });
        } catch (error) {
            if (error instanceof SyncError && error.code === 'http') {
                return null;
            }
            throw error;
        }
        if (result.url.includes('/users/login')) {
            throw new SyncError(
                'logged-out',
                `Log in to AO3 as ${username} to check kudos and comments.`,
            );
        }
        if (script) {
            return parseHtml(unwrapCommentsScript(result.text));
        }
        const doc = parseHtml(result.text);
        if (parseUsername(doc)?.toLowerCase() !== username.toLowerCase()) {
            throw new SyncError(
                'logged-out',
                `Log in to AO3 as ${username} to check kudos and comments.`,
            );
        }
        return doc;
    };

    /** Reads pages until `username` shows up; `null` if unreadable. */
    const search = async (
        source: Source,
    ): Promise<{ found: boolean; cutThreads: number[] } | null> => {
        const cutThreads: number[] = [];
        let lastPage = 1;
        for (let page = 1; page <= lastPage; page += 1) {
            const doc = await load(source.url(page), source.script);
            if (!doc) {
                return null;
            }
            const result = source.parse(doc, username);
            if (result.found) {
                return { found: true, cutThreads: [] };
            }
            lastPage = Math.max(lastPage, result.lastPage);
            cutThreads.push(...result.cutThreads);
        }
        return { found: false, cutThreads };
    };

    const hasKudos = async (id: number): Promise<boolean | null> =>
        (
            await search({
                url: (page) => kudosUrl(id, page),
                script: false,
                parse: parseKudosPage,
            })
        )?.found ?? null;

    const hasCommented = async (id: number): Promise<boolean | null> => {
        const listed = await search({
            url: (page) => commentsUrl(id, page),
            script: true,
            parse: parseCommentsPage,
        });
        if (!listed || listed.found) {
            return listed?.found ?? null;
        }
        // Replies deeper than AO3 lists live on their thread's page.
        const queue = [...listed.cutThreads];
        const seen = new Set(queue);
        for (let read = 0; read < MAX_THREAD_PAGES; read += 1) {
            const thread = queue.shift();
            if (thread === undefined) {
                return false;
            }
            const result = await search({
                url: () => commentThreadUrl(thread),
                script: false,
                // A thread is one page; never ask for page 2.
                parse: (doc, user) => ({
                    ...parseCommentsPage(doc, user),
                    lastPage: 1,
                }),
            });
            if (result?.found) {
                return true;
            }
            for (const next of result?.cutThreads ?? []) {
                if (!seen.has(next)) {
                    seen.add(next);
                    queue.push(next);
                }
            }
        }
        return queue.length === 0 ? false : null;
    };

    const check = async (work: Work): Promise<WorkFeedback> => {
        const previous = feedback[work.key];
        const id = work.id ?? 0;
        const kudos =
            previous?.kudos === true
                ? true
                : work.kudos === 0
                  ? false
                  : await hasKudos(id);
        const commented =
            previous?.commented === true
                ? true
                : work.comments === 0
                  ? false
                  : await hasCommented(id);
        return { kudos, commented, checkedAt: now().toISOString() };
    };

    try {
        for (const work of works) {
            if (work.kind !== 'work' || work.id === null) {
                index += 1;
                continue;
            }
            report(
                'page',
                `Checking kudos and comments: ${index + 1} of ` +
                    `${works.length}, “${work.title}”…`,
            );
            const result = await check(work);
            add(feedback[work.key], -1);
            add(result, 1);
            feedback[work.key] = result;
            index += 1;
            if (index % FEEDBACK_CHECKPOINT_EVERY === 0) {
                await save({ ...feedback });
            }
        }
    } catch (error) {
        // Keep what was found; the next scan skips those works.
        await save({ ...feedback });
        throw error;
    }

    report('saving', 'Saving…');
    await save({ ...feedback });
    return feedback;
}
