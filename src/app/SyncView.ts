import type { SyncErrorCode, SyncProgress } from '@/sync';

export type SyncView = {
    running: boolean;
    progress: SyncProgress | null;
    error: { code: SyncErrorCode | 'unknown'; message: string } | null;
    /** Short message after a sync finished. */
    notice: string | null;
};
