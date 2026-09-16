import type { Work } from '@/model';

/** The `limit` works with the highest `score`, ties by title. */
export function topWorks(
    works: readonly Work[],
    score: (work: Work) => number,
    limit: number,
): Work[] {
    return works
        .filter((work) => work.kind === 'work')
        .sort((a, b) => score(b) - score(a) || a.title.localeCompare(b.title))
        .slice(0, limit);
}
