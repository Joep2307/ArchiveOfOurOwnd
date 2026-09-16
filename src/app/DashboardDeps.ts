import type { Library } from '@/model';
import type { StatsCore } from '@/stats';
import type { StorageArea } from '@/storage';
import type { FetchText, Sleep } from '@/sync';

/** Everything the controller needs from the outside world. */
export type DashboardDeps = {
    storage: StorageArea;
    core: StatsCore;
    fetchText: FetchText;
    sleep: Sleep;
    parseHtml: (html: string) => Document;
    /** Asks for access to AO3; resolves `false` if refused. */
    requestAccess: () => Promise<boolean>;
    download: (name: string, content: string, type: string) => void;
    confirm: (message: string) => boolean;
    now: () => Date;
    createDemo: () => Library;
    delayMs?: number;
};
