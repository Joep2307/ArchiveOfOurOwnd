import type { StorageArea } from '@/storage';

/** Everything the AO3 content script needs from the outside world. */
export type ContentDeps = {
    storage: StorageArea;
    /** Path of the AO3 page, e.g. `/works/123`. */
    pathname: string;
    openDashboard: () => void;
    /** Calls `listener` whenever the extension's storage changes. */
    onStorageChange: (listener: () => void) => void;
};
