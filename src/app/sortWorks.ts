import type { Work } from '@/model';
import type { SortKey } from './SortKey';

const TEXT: Partial<Record<SortKey, (work: Work) => string>> = {
    title: (w) => w.title.toLowerCase(),
    author: (w) =>
        (w.anonymous ? 'anonymous' : (w.authors[0]?.user ?? '')).toLowerCase(),
    fandom: (w) => (w.fandoms[0] ?? '').toLowerCase(),
    lastVisited: (w) => w.lastVisited ?? '',
    updated: (w) => w.updated ?? '',
};

const NUMBER: Partial<Record<SortKey, (work: Work) => number>> = {
    words: (w) => w.words,
    visits: (w) => w.visits,
    kudos: (w) => w.kudos,
};

/** Deleted and hidden works have no length or kudos to compare. */
const WORKS_ONLY = new Set<SortKey>(['words', 'kudos']);

/**
 * Returns a sorted copy. Ties keep history order. For length and
 * kudos, entries without those numbers go last in both directions.
 */
export function sortWorks(
    works: readonly Work[],
    key: SortKey,
    descending: boolean,
): Work[] {
    const direction = descending ? -1 : 1;
    const text = TEXT[key];
    const number = NUMBER[key];
    return works
        .map((work, index) => ({ work, index }))
        .sort((a, b) => {
            if (WORKS_ONLY.has(key)) {
                const missing =
                    Number(a.work.kind !== 'work') -
                    Number(b.work.kind !== 'work');
                if (missing !== 0) {
                    return missing;
                }
            }
            let result = 0;
            if (text) {
                result = text(a.work).localeCompare(text(b.work));
            } else if (number) {
                result = number(a.work) - number(b.work);
            }
            return result * direction || a.index - b.index;
        })
        .map(({ work }) => work);
}
