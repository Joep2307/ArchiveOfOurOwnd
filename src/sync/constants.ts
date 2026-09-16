/** Pause between history pages, to stay well under AO3 limits. */
export const PAGE_DELAY_MS = 1500;

/** Wait used when AO3 says "too many requests" without a hint. */
export const RATE_LIMIT_WAIT_MS = 60_000;

/** Back-off for server errors; doubled on each retry. */
export const SERVER_ERROR_WAIT_MS = 5_000;

export const MAX_RETRIES = 6;

/** Save partial results every this many pages. */
export const CHECKPOINT_EVERY = 20;

/** Days a relative AO3 date may drift between two syncs. */
export const DATE_TOLERANCE_DAYS = 1;
