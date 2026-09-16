import type { Work } from '@/model';
import { isSameVisit } from './isSameVisit';

/**
 * A page is unchanged when every real work on it is already stored
 * with the same visit. History is newest-first, so every later page
 * is unchanged too.
 */
export function isPageUnchanged(
    works: readonly Work[],
    storedByKey: ReadonlyMap<string, Work>,
): boolean {
    const real = works.filter((work) => work.kind !== 'deleted');
    if (real.length === 0) {
        return false;
    }
    return real.every((work) => {
        const stored = storedByKey.get(work.key);
        return stored !== undefined && isSameVisit(work, stored);
    });
}
