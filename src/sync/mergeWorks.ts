import type { Work } from '@/model';

/**
 * Fresh entries first (in history order), then stored entries that
 * the fresh pages did not cover.
 */
export function mergeWorks(
    fresh: readonly Work[],
    stored: readonly Work[],
): Work[] {
    const seen = new Set<string>();
    const merged: Work[] = [];
    for (const work of [...fresh, ...stored]) {
        if (!seen.has(work.key)) {
            seen.add(work.key);
            merged.push(work);
        }
    }
    return merged;
}
