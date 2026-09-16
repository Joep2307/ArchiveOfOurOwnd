import type { FetchText } from './FetchText';
import type { Sleep } from './Sleep';

/** Dependencies and callbacks for `fetchWithRetry`. */
export type RetryOptions = {
    fetchText: FetchText;
    sleep: Sleep;
    signal?: AbortSignal | undefined;
    /** Called before each wait, so the UI can say why it paused. */
    onWait?: ((ms: number, status: number) => void) | undefined;
};
