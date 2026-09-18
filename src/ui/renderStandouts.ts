import type { LengthOrder } from '@/app';
import { formatNumber, plural } from '@/format';
import { renderPanel } from './renderPanel';
import { renderSection } from './renderSection';
import { renderToggle } from './renderToggle';
import { renderWorkList } from './renderWorkList';
import type { ViewContext } from './ViewContext';
import { el } from './el';

/** Most visited, longest or shortest, most loved and hidden gems. */
export function renderStandouts(context: ViewContext): HTMLElement {
    const { state, stats, controller } = context;
    const shortest = state.lengthOrder === 'shortest';
    return renderSection(
        'standouts',
        'Standouts',
        renderPanel(
            {
                title: 'Most visited',
                subtitle: 'Your comfort reads.',
                actions: el('button', {
                    className: 'button button--ghost',
                    text: 'Review these works',
                    attrs: { type: 'button' },
                    on: {
                        click: () => {
                            controller.setReviewOpen(true);
                        },
                    },
                }),
            },
            renderWorkList(
                stats.mostVisited,
                (work) =>
                    plural(
                        state.library?.reviews?.[work.key]?.status ===
                            'finished'
                            ? (state.library.reviews[work.key]?.readCount ?? 1)
                            : work.visits,
                        'visit',
                    ),
                'Nothing yet.',
                state,
                controller,
                'standouts-visits',
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
                state,
                controller,
                'standouts-length',
            ),
        ),
        renderPanel(
            { title: 'Most kudos', subtitle: 'Crowd favourites.' },
            renderWorkList(
                stats.mostKudos,
                (work) => plural(work.kudos, 'kudo'),
                'Nothing yet.',
                state,
                controller,
                'standouts-kudos',
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
                    plural(
                        state.library?.reviews?.[work.key]?.status ===
                            'finished'
                            ? (state.library.reviews[work.key]?.readCount ?? 1)
                            : work.visits,
                        'visit',
                    ),
                'Re-read a work to see it here.',
                state,
                controller,
                'standouts-gems',
            ),
        ),
    );
}
