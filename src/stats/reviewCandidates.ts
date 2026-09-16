import type { Work } from '@/model';

/** Rank before excluding reviews to keep the queue bounded. */
export function reviewCandidates(works: readonly Work[]): Work[] {
    const readable = works.filter((work) => work.kind === 'work');
    const longest = [...readable]
        .sort((a, b) => b.words - a.words || a.key.localeCompare(b.key))
        .slice(0, 10);
    const mostVisited = readable
        .filter((work) => work.visits > 1)
        .sort((a, b) => b.visits - a.visits || a.key.localeCompare(b.key))
        .slice(0, 10);
    return [
        ...new Map(
            [...longest, ...mostVisited].map((work) => [work.key, work]),
        ).values(),
    ];
}
