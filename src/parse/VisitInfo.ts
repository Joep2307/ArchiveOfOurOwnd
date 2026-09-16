/** The visit line of one history blurb. */
export type VisitInfo = {
    lastVisited: string | null;
    visits: number;
    updateAvailable: boolean;
    markedForLater: boolean;
    deleted: boolean;
};
