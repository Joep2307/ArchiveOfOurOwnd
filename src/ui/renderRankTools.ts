import type { RankMetric } from '@/stats';
import { el } from './el';
import { renderToggle } from './renderToggle';
import type { ViewContext } from './ViewContext';

/** The "click to filter" hint and the Works/Words/Visits toggle. */
export function renderRankTools(context: ViewContext): HTMLElement {
    const { state, controller } = context;
    return el(
        'div',
        { className: 'section__tools' },
        el('span', {
            className: 'muted',
            text: 'Click any row to filter the whole page.',
        }),
        renderToggle(
            'Rank by',
            [
                { id: 'works', label: 'Works' },
                { id: 'words', label: 'Words' },
                { id: 'visits', label: 'Visits' },
            ],
            state.rankBy,
            (id) => {
                controller.setRankBy(id as RankMetric);
            },
        ),
    );
}
