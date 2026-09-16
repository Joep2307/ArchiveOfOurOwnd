import type { Work } from './Work';

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
};
