import type { Library } from '@/model';
import type { RankMetric, WorkFilter } from '@/stats';
import type { DashboardView } from './DashboardView';
import type { LengthOrder } from './LengthOrder';
import type { SortKey } from './SortKey';
import type { SpeedTest } from './SpeedTest';
import type { SyncView } from './SyncView';

export type DashboardState = {
    /** `undefined` while loading from storage. */
    library: Library | null | undefined;
    /** The page the menu has open. */
    view: DashboardView;
    /** Showing generated demo data instead of the stored history. */
    demo: boolean;
    reviewOpen: boolean;
    /** Answers kept visible until the current popup closes. */
    reviewSessionAnswered: string[];
    /** The dashboard runs outside the extension (local preview). */
    standalone: boolean;
    filter: WorkFilter;
    sync: SyncView;
    table: {
        sort: SortKey;
        descending: boolean;
        page: number;
    };
    /** Lists expanded with "Show all", by list id. */
    expanded: Record<string, boolean>;
    rankBy: RankMetric;
    /** Which end of the length ranking the standouts show. */
    lengthOrder: LengthOrder;
    theme: 'system' | 'light' | 'dark';
    /** Highlight read works on archiveofourown.org. */
    highlightOnAo3: boolean;
    /** The reader's own speed, used for reading time estimates. */
    wordsPerMinute: number;
    speedTest: SpeedTest;
};
