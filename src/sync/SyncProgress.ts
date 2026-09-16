export type SyncProgress = {
    phase: 'login' | 'page' | 'waiting' | 'saving';
    page: number;
    lastPage: number | null;
    worksSeen: number;
    message: string;
    /** Second line in the banner; a default note when missing. */
    detail?: string;
};
