import type { Work } from '@/model';

/** Lower-cased text a search query is matched against. */
export function searchText(work: Work): string {
    return [
        work.title,
        ...work.authors.flatMap((author) => [author.user, author.pseud]),
        ...work.fandoms,
        ...work.relationships,
        ...work.characters,
        ...work.freeforms,
        ...work.series.map((series) => series.title),
        work.summary,
    ]
        .join('\n')
        .toLowerCase();
}
