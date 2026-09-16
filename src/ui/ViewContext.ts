import type { DashboardController, DashboardState } from '@/app';
import type { Stats } from '@/stats';

/** What every section renderer receives. */
export type ViewContext = {
    state: DashboardState;
    stats: Stats;
    controller: DashboardController;
};
