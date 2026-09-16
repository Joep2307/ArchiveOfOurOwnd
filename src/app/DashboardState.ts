import type { Library } from '@/model';
import type { RankMetric, WorkFilter } from '@/stats';
import type { SortKey } from './SortKey';
import type { SyncView } from './SyncView';

export type DashboardState = {
    /** `undefined` while loading from storage. */
    library: Library | null | undefined;
    /** Showing generated demo data instead of the stored history. */
    demo: boolean;
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
    theme: 'system' | 'light' | 'dark';
    /** Highlight read works on archiveofourown.org. */
    highlightOnAo3: boolean;
};
