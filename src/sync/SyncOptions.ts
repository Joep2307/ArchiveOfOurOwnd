import type { Library } from '@/model';
import type { FetchText } from './FetchText';
import type { Sleep } from './Sleep';
import type { SyncProgress } from './SyncProgress';

/** Dependencies and settings for `runSync`. */
export type SyncOptions = {
    fetchText: FetchText;
    parseHtml: (html: string) => Document;
    sleep: Sleep;
    /** Loads what is stored for an account, if anything. */
    loadStored: (username: string) => Promise<Library | null>;
    /** Persists partial and final results. */
    save: (library: Library) => Promise<void>;
    /**
     * Account synced last. When given, the login check reads the
     * first history page instead of an extra request for AO3's home.
     */
    username?: string | undefined;
    /** Re-read every page instead of stopping at known ones. */
    full?: boolean;
    delayMs?: number;
    signal?: AbortSignal;
    now?: () => Date;
    onProgress?: (progress: SyncProgress) => void;
};
