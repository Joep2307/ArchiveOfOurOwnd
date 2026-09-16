import { RATE_LIMIT_WAIT_MS, SERVER_ERROR_WAIT_MS } from './constants';

/**
 * How long to wait before retrying a response with `status`, or
 * `null` when the status should not be retried.
 */
export function retryWaitMs(
    status: number,
    retryAfter: string | null,
    attempt: number,
): number | null {
    if (status === 429) {
        const seconds = Number(retryAfter);
        return Number.isFinite(seconds) && seconds > 0
            ? seconds * 1000
            : RATE_LIMIT_WAIT_MS;
    }
    if (status >= 500 || status === 0) {
        return SERVER_ERROR_WAIT_MS * 2 ** attempt;
    }
    return null;
}
