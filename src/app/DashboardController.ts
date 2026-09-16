import type { ReadingReview, Work } from '@/model';
import type { Facet, Period, RankMetric } from '@/stats';
import type { DashboardView } from './DashboardView';
import type { LengthOrder } from './LengthOrder';
import type { SortKey } from './SortKey';

export type DashboardController = {
    setReviewOpen: (open: boolean) => void;
    reviewWork: (
        key: string,
        status: ReadingReview['status'] | null,
        readCount?: number,
    ) => Promise<void>;
    load: () => Promise<void>;
    sync: (full: boolean) => Promise<void>;
    /**
     * Looks up on AO3 which works the reader left kudos or comments
     * on. Only checks works that are new or opened since last time.
     */
    checkFeedback: () => Promise<void>;
    /** Stops the running sync or kudos and comments check. */
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
    /** Opens a page from the menu. */
    showView: (view: DashboardView) => void;
    setPage: (page: number) => void;
    toggleExpanded: (id: string) => void;
    setRankBy: (metric: RankMetric) => void;
    setTheme: (theme: 'system' | 'light' | 'dark') => void;
    setHighlightOnAo3: (enabled: boolean) => Promise<void>;
    /** Saves the reader's speed; out-of-range values are clamped. */
    setWordsPerMinute: (wordsPerMinute: number) => Promise<void>;
    startSpeedTest: () => void;
    /**
     * Stops the test, measures the speed over `words` words and saves it
     * as the reader's speed.
     */
    finishSpeedTest: (words: number) => Promise<void>;
    resetSpeedTest: () => void;
    dismissMessage: () => void;
};
