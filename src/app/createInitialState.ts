import { emptyFilter, WORDS_PER_MINUTE } from '@/stats';
import type { DashboardState } from './DashboardState';

export function createInitialState(standalone: boolean): DashboardState {
    return {
        library: undefined,
        view: 'dashboard',
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
        wordsPerMinute: WORDS_PER_MINUTE,
        speedTest: { startedAt: null, result: null, tooFast: false },
    };
}
