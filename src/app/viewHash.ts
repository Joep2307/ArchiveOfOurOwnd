import { VIEW_HASH_PREFIX } from './constants';
import type { DashboardView } from './DashboardView';

/** The URL hash that opens `view`. */
export function viewHash(view: DashboardView): string {
    return view === 'dashboard'
        ? VIEW_HASH_PREFIX
        : `${VIEW_HASH_PREFIX}${view}`;
}
