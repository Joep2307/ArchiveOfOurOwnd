import { formatNumber } from '@/format';
import type { CountEntry, RankMetric } from '@/stats';
import { renderBarList, type ChartItem } from './charts';
import { el } from './el';
import { facetFromItem } from './facetFromItem';
import { renderEmpty } from './renderEmpty';
import { renderPanel } from './renderPanel';
import { renderSection } from './renderSection';
import { renderToggle } from './renderToggle';
import { toChartItems } from './toChartItems';
import type { ViewContext } from './ViewContext';

const COLLAPSED = 10;
const EXPANDED = 100;

/** Top authors, fandoms, ships, characters, tags and series. */
export function renderTopLists(context: ViewContext): HTMLElement {
    const { state, stats, controller } = context;
    const metric = state.rankBy;
    const select = (item: ChartItem): void => {
        controller.toggleFacet(facetFromItem(item));
    };

    const list = (
        id: string,
        title: string,
        entries: CountEntry[],
    ): HTMLElement => {
        const open = state.expanded[id] === true;
        const sorted =
            metric === 'works'
                ? entries
                : [...entries].sort((a, b) => b[metric] - a[metric]);
        const shown = sorted.slice(0, open ? EXPANDED : COLLAPSED);
        const more =
            entries.length > COLLAPSED
                ? el('button', {
                      className: 'link-button',
                      text: open
                          ? 'Show fewer'
                          : `Show top ${Math.min(EXPANDED, entries.length)}`,
                      attrs: { type: 'button', 'aria-expanded': open },
                      on: {
                          click: () => {
                              controller.toggleExpanded(id);
                          },
                      },
                  })
                : null;
        return renderPanel(
            {
                title,
                subtitle: `${formatNumber(entries.length)} in total`,
            },
            shown.length === 0
                ? renderEmpty('Nothing here yet.')
                : renderBarList(
                      toChartItems(shown, state.filter.facets, metric),
                      {
                          label: title,
                          onSelect: select,
                          ranked: true,
                      },
                  ),
            more,
        );
    };

    const toggle = renderToggle(
        'Rank by',
        [
            { id: 'works', label: 'Works' },
            { id: 'words', label: 'Words' },
            { id: 'visits', label: 'Visits' },
        ],
        metric,
        (id) => {
            controller.setRankBy(id as RankMetric);
        },
    );

    const section = renderSection(
        'people',
        'Favourites',
        list('top-authors', 'Authors', stats.authors),
        list('top-fandoms', 'Fandoms', stats.fandoms),
        list('top-ships', 'Relationships', stats.relationships),
        list('top-characters', 'Characters', stats.characters),
        list('top-tags', 'Additional tags', stats.freeforms),
        list('top-series', 'Series', stats.series),
    );
    const heading = section.querySelector('.section__title');
    heading?.after(
        el(
            'div',
            { className: 'section__tools' },
            el('span', {
                className: 'muted',
                text: 'Click any row to filter the whole page.',
            }),
            toggle,
        ),
    );
    return section;
}
