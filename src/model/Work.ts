import type { AuthorRef } from './AuthorRef';
import type { Rating } from './Rating';
import type { SeriesRef } from './SeriesRef';
import type { WorkKind } from './WorkKind';

/** One entry of the reading history, as stored locally. */
export type Work = {
    /** Stable key: `work-<id>` or `deleted-<n>`. */
    key: string;
    kind: WorkKind;
    /** AO3 work id, `null` for deleted works. */
    id: number | null;
    title: string;
    authors: AuthorRef[];
    anonymous: boolean;
    fandoms: string[];
    rating: Rating;
    /** Pairing categories, e.g. `F/M`, `Gen`. */
    categories: string[];
    warnings: string[];
    relationships: string[];
    characters: string[];
    freeforms: string[];
    language: string;
    words: number;
    chaptersPosted: number;
    /** `null` when the total is unknown (`?`). */
    chaptersTotal: number | null;
    complete: boolean;
    kudos: number;
    comments: number;
    bookmarks: number;
    hits: number;
    series: SeriesRef[];
    summary: string;
    /** Date the work was last updated, `YYYY-MM-DD`, or `null`. */
    updated: string | null;
    /** Date you last opened it, `YYYY-MM-DD`, or `null`. */
    lastVisited: string | null;
    visits: number;
    updateAvailable: boolean;
    markedForLater: boolean;
};
