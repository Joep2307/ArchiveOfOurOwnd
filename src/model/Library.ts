import type { Work } from './Work';

export type ReadingReview = {
    status: 'finished' | 'partial' | 'opened' | 'unsure';
    /** Snapshot: later updates must not inflate confirmed reading. */
    words: number;
    reviewedAt: string;
    /** Full reads, independent of visits. Older finished reviews mean 1. */
    readCount?: number;
};

/** Everything the extension stores about one AO3 account. */
export type Library = {
    version: 1;
    username: string;
    /** ISO timestamp of the last completed sync, or `null`. */
    syncedAt: string | null;
    /** Works in history order (most recently visited first). */
    works: Work[];
    /**
     * Keys of works the reader removed. They stay hidden, even when a
     * sync finds them again.
     */
    removed?: string[];
    reviews?: Record<string, ReadingReview>;
};
