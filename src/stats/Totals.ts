export type Totals = {
    /** Every history entry, including deleted and mystery works. */
    entries: number;
    /** Readable works (not deleted or hidden). */
    works: number;
    deleted: number;
    mystery: number;
    words: number;
    confirmedWords: number;
    estimatedWords: number;
    visits: number;
    authors: number;
    fandoms: number;
    relationships: number;
    characters: number;
    tags: number;
    series: number;
    languages: number;
    /** Works explicitly confirmed as read more than once. */
    rereads: number;
    complete: number;
    inProgress: number;
    updatesAvailable: number;
    markedForLater: number;
    chapters: number;
    /** Estimated minutes to read `words`. */
    readingMinutes: number;
    /** `words` expressed in typical novels. */
    novels: number;
    firstVisited: string | null;
    lastVisited: string | null;
};
