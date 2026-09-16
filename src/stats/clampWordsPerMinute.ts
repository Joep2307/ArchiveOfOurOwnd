import {
    MAX_WORDS_PER_MINUTE,
    MIN_WORDS_PER_MINUTE,
    WORDS_PER_MINUTE,
} from './constants';

/**
 * A usable reading speed: whole words a minute within the allowed
 * range. Anything that is not a finite number falls back to average.
 */
export function clampWordsPerMinute(value: unknown): number {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        return WORDS_PER_MINUTE;
    }
    return Math.min(
        MAX_WORDS_PER_MINUTE,
        Math.max(MIN_WORDS_PER_MINUTE, Math.round(value)),
    );
}
