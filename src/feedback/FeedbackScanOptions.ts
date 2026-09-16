import type { Work, WorkFeedback } from '@/model';
import type { FetchText, Sleep, SyncProgress } from '@/sync';

/** Dependencies and settings for `runFeedbackScan`. */
export type FeedbackScanOptions = {
    /** The AO3 account whose kudos and comments are looked for. */
    username: string;
    /** Works to check, in the order to check them. */
    works: readonly Work[];
    /** Results of earlier checks, by work key. */
    feedback: Readonly<Record<string, WorkFeedback>>;
    fetchText: FetchText;
    parseHtml: (html: string) => Document;
    sleep: Sleep;
    /** Persists partial and final results. */
    save: (feedback: Record<string, WorkFeedback>) => Promise<void>;
    delayMs?: number | undefined;
    signal?: AbortSignal | undefined;
    now?: () => Date;
    onProgress?: (progress: SyncProgress) => void;
};
