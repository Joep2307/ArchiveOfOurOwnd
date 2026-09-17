import type { DashboardView } from '@/app';
import { viewHash } from '@/app';
import { plural } from '@/format';
import type { CountEntry } from '@/stats';
import type { ChartItem } from './charts';
import { renderBarList } from './charts';
import { HIGHLIGHT_ROWS, VIEW_LINKS } from './constants';
import { el } from './el';
import { facetFromItem } from './facetFromItem';
import { renderEmpty } from './renderEmpty';
import { renderPanel } from './renderPanel';
import { renderSection } from './renderSection';
import { renderWorkList } from './renderWorkList';
import { toChartItems } from './toChartItems';
import type { ViewContext } from './ViewContext';

function seeMore(view: DashboardView): HTMLElement {
    return el('a', {
        className: 'link-button',
        text: `${VIEW_LINKS[view].label} →`,
        attrs: { href: viewHash(view) },
    });
}

/** A short preview of each page, linking through to it. */
export function renderHighlights(context: ViewContext): HTMLElement {
    const { state, stats, controller } = context;
    const top = (entries: CountEntry[], label: string): HTMLElement =>
        entries.length === 0
            ? renderEmpty('Nothing here yet.')
            : renderBarList(
                  toChartItems(
                      entries.slice(0, HIGHLIGHT_ROWS),
                      state.filter.facets,
                  ),
                  {
                      label,
                      ranked: true,
                      onSelect: (item: ChartItem) => {
                          controller.toggleFacet(facetFromItem(item));
                      },
                  },
              );

    return renderSection(
        'highlights',
        'Highlights',
        renderPanel(
            { title: 'Top genres', actions: seeMore('genres') },
            top(stats.freeforms, 'Top genres'),
        ),
        renderPanel(
            { title: 'Top fandoms', actions: seeMore('favourites') },
            top(stats.fandoms, 'Top fandoms'),
        ),
        renderPanel(
            { title: 'Most visited', actions: seeMore('standouts') },
            renderWorkList(
                stats.mostVisited.slice(0, HIGHLIGHT_ROWS),
                (work) => {
                    const review = state.library?.reviews?.[work.key];
                    const visits =
                        review?.status === 'finished'
                            ? (review.readCount ?? 1)
                            : work.visits;
                    return plural(visits, 'visit');
                },
                'Nothing yet.',
                state,
                controller,
            ),
        ),
    );
}
