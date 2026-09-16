import type { DashboardView } from './DashboardView';

/** Every page, in menu order. The first one is the start page. */
export const DASHBOARD_VIEWS: readonly DashboardView[] = [
    'dashboard',
    'genres',
    'time',
    'shape',
    'favourites',
    'standouts',
    'works',
    'settings',
];

/** Pages live in the URL hash as `#/<view>`. */
export const VIEW_HASH_PREFIX = '#/';

/** A speed test finished faster than this is not counted. */
export const MIN_SPEED_TEST_MS = 5_000;
