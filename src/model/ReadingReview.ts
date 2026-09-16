/** The reader's own answer about one work in the review popup. */
export type ReadingReview = {
    status: 'finished' | 'partial' | 'opened' | 'unsure';
    /** Snapshot: later updates must not inflate confirmed reading. */
    words: number;
    reviewedAt: string;
    /** Full reads, independent of visits. Older finished reviews mean 1. */
    readCount?: number;
};
