import { MAX_RETRIES } from './constants';
import type { FetchText, FetchTextResult } from './FetchText';
import { retryWaitMs } from './retryWaitMs';
import { SyncError } from './SyncError';
import type { Sleep } from './Sleep';

export type RetryOptions = {
    fetchText: FetchText;
    sleep: Sleep;
    signal?: AbortSignal | undefined;
    /** Called before each wait, so the UI can say why it paused. */
    onWait?: ((ms: number, status: number) => void) | undefined;
};

/** Fetches a page, waiting and retrying on 429 and 5xx. */
export async function fetchWithRetry(
    url: string,
    options: RetryOptions,
): Promise<FetchTextResult> {
    const { fetchText, sleep, signal, onWait } = options;
    for (let attempt = 0; ; attempt += 1) {
        let result: FetchTextResult;
        try {
            result = await fetchText(url, signal);
        } catch (error) {
            const retryable =
                error instanceof SyncError && error.code === 'network';
            if (!retryable || attempt >= MAX_RETRIES) {
                throw error;
            }
            const wait = retryWaitMs(0, null, attempt) ?? 0;
            onWait?.(wait, 0);
            await sleep(wait, signal);
            continue;
        }
        if (result.status >= 200 && result.status < 300) {
            return result;
        }
        const wait = retryWaitMs(result.status, result.retryAfter, attempt);
        if (wait === null || attempt >= MAX_RETRIES) {
            throw new SyncError(
                'http',
                `AO3 answered with status ${result.status}.`,
            );
        }
        onWait?.(wait, result.status);
        await sleep(wait, signal);
    }
}
