import { DASHBOARD_VIEWS, VIEW_HASH_PREFIX } from './constants';
import type { DashboardView } from './DashboardView';

/**
 * Reads the page from a URL hash such as `#/genres`. `#/` and an empty
 * hash mean the start page; any other hash (`#main`) is not a page.
 */
export function viewFromHash(hash: string): DashboardView | null {
    if (hash === '' || hash === '#' || hash === VIEW_HASH_PREFIX) {
        return 'dashboard';
    }
    if (!hash.startsWith(VIEW_HASH_PREFIX)) {
        return null;
    }
    const id = hash.slice(VIEW_HASH_PREFIX.length);
    return DASHBOARD_VIEWS.find((view) => view === id) ?? null;
}
