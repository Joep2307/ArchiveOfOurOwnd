/** Starts the timer worker, or returns `null` if not possible. */
export function createTimerWorker(): Worker | null {
    try {
        return new Worker(new URL('../sync/timerWorker.ts', import.meta.url), {
            type: 'module',
        });
    } catch {
        return null;
    }
}
