/** Live state of a sync, written to storage while it runs. */
export type SyncStatus = {
    state: 'idle' | 'running' | 'waiting' | 'done' | 'error';
    page: number;
    lastPage: number | null;
    worksSeen: number;
    message: string;
    /** ISO timestamp of the last update to this status. */
    updatedAt: string;
};
