import { SyncError } from './SyncError';
import type { Sleep } from './Sleep';

/** `Sleep` built on `setTimeout`. */
export const timeoutSleep: Sleep = (ms, signal) =>
    new Promise((resolve, reject) => {
        if (signal?.aborted) {
            reject(new SyncError('aborted', 'Sync stopped.'));
            return;
        }
        const timer = setTimeout(() => {
            signal?.removeEventListener('abort', onAbort);
            resolve();
        }, ms);
        function onAbort(): void {
            clearTimeout(timer);
            reject(new SyncError('aborted', 'Sync stopped.'));
        }
        signal?.addEventListener('abort', onAbort, { once: true });
    });
