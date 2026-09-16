import type { LengthOrder } from '@/app';
import { formatNumber, plural } from '@/format';
import { renderPanel } from './renderPanel';
import { renderSection } from './renderSection';
import { renderToggle } from './renderToggle';
import { renderWorkList } from './renderWorkList';
import type { ViewContext } from './ViewContext';

/** Most revisited, longest or shortest, most loved and hidden gems. */
export function renderStandouts(context: ViewContext): HTMLElement {
    const { state, stats, controller } = context;
    const shortest = state.lengthOrder === 'shortest';
    return renderSection(
        'standouts',
        'Standouts',
        renderPanel(
            { title: 'Most revisited', subtitle: 'Your comfort reads.' },
            renderWorkList(
                stats.mostVisited,
                (work) => plural(work.visits, 'visit'),
                'Nothing yet.',
            ),
        ),
        renderPanel(
            {
                title: shortest ? 'Shortest' : 'Longest',
                subtitle: shortest ? 'Quick reads.' : 'The epics you took on.',
                actions: renderToggle(
                    'Length',
                    [
                        { id: 'longest', label: 'Longest' },
                        { id: 'shortest', label: 'Shortest' },
                    ],
                    state.lengthOrder,
                    (id) => {
                        controller.setLengthOrder(id as LengthOrder);
                    },
                ),
            },
            renderWorkList(
                shortest ? stats.shortest : stats.longest,
                (work) => `${formatNumber(work.words)} words`,
                'Nothing yet.',
            ),
        ),
        renderPanel(
            { title: 'Most kudos', subtitle: 'Crowd favourites.' },
            renderWorkList(
                stats.mostKudos,
                (work) => plural(work.kudos, 'kudo'),
                'Nothing yet.',
            ),
        ),
        renderPanel(
            {
                title: 'Hidden gems',
                subtitle: 'Re-read by you, fewest kudos.',
            },
            renderWorkList(
                stats.hiddenGems,
                (work) =>
                    `${plural(work.kudos, 'kudo')} · ` +
                    plural(work.visits, 'visit'),
                'Re-read a work to see it here.',
            ),
        ),
    );
}
