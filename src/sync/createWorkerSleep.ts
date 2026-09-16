import type { Sleep } from './Sleep';
import { SyncError } from './SyncError';
import { timeoutSleep } from './timeoutSleep';

type TimerReply = { id: number };

/**
 * `Sleep` whose timers run in a Web Worker. Browsers heavily
 * throttle timers in background tabs, but not in workers, so a
 * sync keeps its pace when you switch tabs. Falls back to
 * `setTimeout` if workers are unavailable.
 */
export function createWorkerSleep(worker: Worker | null): Sleep {
    if (!worker) {
        return timeoutSleep;
    }
    let nextId = 1;
    const pending = new Map<number, () => void>();
    worker.addEventListener('message', (event: MessageEvent) => {
        const { id } = event.data as TimerReply;
        pending.get(id)?.();
        pending.delete(id);
    });

    return (ms, signal) =>
        new Promise((resolve, reject) => {
            if (signal?.aborted) {
                reject(new SyncError('aborted', 'Sync stopped.'));
                return;
            }
            const id = nextId;
            nextId += 1;
            const onAbort = (): void => {
                pending.delete(id);
                reject(new SyncError('aborted', 'Sync stopped.'));
            };
            pending.set(id, () => {
                signal?.removeEventListener('abort', onAbort);
                resolve();
            });
            signal?.addEventListener('abort', onAbort, { once: true });
            worker.postMessage({ id, ms });
        });
}
