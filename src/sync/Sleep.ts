/** Waits `ms`; rejects when `signal` aborts. */
export type Sleep = (ms: number, signal?: AbortSignal) => Promise<void>;
