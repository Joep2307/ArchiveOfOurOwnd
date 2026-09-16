import { formatNumber } from '@/format';
import type { CountEntry } from '@/stats';
import type { ChartItem } from './charts';
import { renderBarList } from './charts';
import { TOP_LIST_COLLAPSED, TOP_LIST_EXPANDED } from './constants';
import { el } from './el';
import { facetFromItem } from './facetFromItem';
import { renderEmpty } from './renderEmpty';
import { renderPanel } from './renderPanel';
import { toChartItems } from './toChartItems';
import type { ViewContext } from './ViewContext';

/** A ranked, clickable list with a "Show top N" button. */
export function renderTopList(
    context: ViewContext,
    id: string,
    title: string,
    entries: CountEntry[],
    className?: string,
): HTMLElement {
    const { state, controller } = context;
    const metric = state.rankBy;
    const open = state.expanded[id] === true;
    const sorted =
        metric === 'works'
            ? entries
            : [...entries].sort((a, b) => b[metric] - a[metric]);
    const shown = sorted.slice(
        0,
        open ? TOP_LIST_EXPANDED : TOP_LIST_COLLAPSED,
    );
    const more =
        entries.length > TOP_LIST_COLLAPSED
            ? el('button', {
                  className: 'link-button',
                  text: open
                      ? 'Show fewer'
                      : `Show top ${Math.min(
                            TOP_LIST_EXPANDED,
                            entries.length,
                        )}`,
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
            ...(className ? { className } : {}),
        },
        shown.length === 0
            ? renderEmpty('Nothing here yet.')
            : renderBarList(toChartItems(shown, state.filter.facets, metric), {
                  label: title,
                  onSelect: (item: ChartItem) => {
                      controller.toggleFacet(facetFromItem(item));
                  },
                  ranked: true,
              }),
        more,
    );
}
