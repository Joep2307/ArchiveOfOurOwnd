import type { DashboardDeps } from '@/app';
import type { StatsCore } from '@/stats';

/** Test and preview overrides for `bootDashboard`. */
export type BootOptions = {
    /** Override the default demo view (tests). */
    demo?: boolean;
    /** Override the wasm loader (tests). */
    core?: StatsCore;
    /** Override the storage (tests, preview). */
    deps?: Partial<DashboardDeps>;
};
