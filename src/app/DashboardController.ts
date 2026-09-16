import type { Work } from '@/model';
import type { Facet, Period, RankMetric } from '@/stats';
import type { LengthOrder } from './LengthOrder';
import type { SortKey } from './SortKey';

export type DashboardController = {
    load: () => Promise<void>;
    sync: (full: boolean) => Promise<void>;
    stopSync: () => void;
    showDemo: () => void;
    hideDemo: () => void;
    exportJson: () => void;
    exportCsv: () => void;
    importJson: (text: string) => Promise<void>;
    clearData: () => Promise<void>;
    setQuery: (query: string) => void;
    setPeriod: (period: Period) => void;
    toggleFacet: (facet: Facet) => void;
    removeFacet: (facet: Facet) => void;
    clearFilters: () => void;
    sortBy: (key: SortKey) => void;
    setSort: (key: SortKey, descending: boolean) => void;
    setLengthOrder: (order: LengthOrder) => void;
    /** Hides a work from the dashboard, also after later syncs. */
    removeWork: (work: Work) => Promise<void>;
    /** Brings back every removed work. */
    restoreRemoved: () => Promise<void>;
    setPage: (page: number) => void;
    toggleExpanded: (id: string) => void;
    setRankBy: (metric: RankMetric) => void;
    setTheme: (theme: 'system' | 'light' | 'dark') => void;
    setHighlightOnAo3: (enabled: boolean) => Promise<void>;
    dismissMessage: () => void;
};
