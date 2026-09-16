import { emptyFilter } from '@/stats';
import type { DashboardState } from './DashboardState';

export function createInitialState(standalone: boolean): DashboardState {
    return {
        library: undefined,
        demo: false,
        reviewOpen: false,
        reviewSessionAnswered: [],
        standalone,
        filter: emptyFilter(),
        sync: { running: false, progress: null, error: null, notice: null },
        table: { sort: 'lastVisited', descending: true, page: 0 },
        expanded: {},
        rankBy: 'works',
        lengthOrder: 'longest',
        theme: 'system',
        highlightOnAo3: true,
    };
}
