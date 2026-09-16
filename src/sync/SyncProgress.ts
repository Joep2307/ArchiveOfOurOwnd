export type SyncProgress = {
    phase: 'login' | 'page' | 'waiting' | 'saving';
    page: number;
    lastPage: number | null;
    worksSeen: number;
    message: string;
};
