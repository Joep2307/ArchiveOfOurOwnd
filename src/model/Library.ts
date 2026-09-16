import type { ReadingReview } from './ReadingReview';
import type { Work } from './Work';
import type { WorkFeedback } from './WorkFeedback';

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
    /** Kudos and comments found on AO3, by work key. */
    feedback?: Record<string, WorkFeedback>;
};
