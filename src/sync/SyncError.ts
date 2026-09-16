import type { SyncErrorCode } from './SyncErrorCode';

/** A sync failure with a code the UI can explain. */
export class SyncError extends Error {
    readonly code: SyncErrorCode;

    constructor(code: SyncErrorCode, message: string) {
        super(message);
        this.name = 'SyncError';
        this.code = code;
    }
}
