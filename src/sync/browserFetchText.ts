import { SyncError } from './SyncError';
import type { FetchText } from './FetchText';

/** `FetchText` using `fetch` with credentials. */
export const browserFetchText: FetchText = async (url, signal) => {
    let response: Response;
    try {
        response = await fetch(url, {
            credentials: 'include',
            redirect: 'follow',
            ...(signal ? { signal } : {}),
        });
    } catch (error) {
        if (signal?.aborted) {
            throw new SyncError('aborted', 'Sync stopped.');
        }
        throw new SyncError(
            'network',
            `Could not reach AO3 (${String(error)}).`,
        );
    }
    return {
        status: response.status,
        url: response.url,
        retryAfter: response.headers.get('retry-after'),
        text: await response.text(),
    };
};
