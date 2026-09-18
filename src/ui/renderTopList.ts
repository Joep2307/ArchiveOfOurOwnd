import { formatNumber } from '@/format';
import type { CountEntry } from '@/stats';
import type { ChartItem } from './charts';
import { renderBarList } from './charts';
import { TOP_LIST_COLLAPSED } from './constants';
import { renderExpandableList } from './renderExpandableList';
import { facetFromItem } from './facetFromItem';
import { renderEmpty } from './renderEmpty';
import { renderPanel } from './renderPanel';
import { toChartItems } from './toChartItems';
import type { ViewContext } from './ViewContext';

/** A ranked, clickable list that can reveal every result. */
export function renderTopList(
    context: ViewContext,
    id: string,
    title: string,
    entries: CountEntry[],
    className?: string,
): HTMLElement {
    const { state, controller } = context;
    const metric = state.rankBy;
    const sorted =
        metric === 'works'
            ? entries
            : [...entries].sort((a, b) => b[metric] - a[metric]);
    return renderPanel(
        {
            title,
            subtitle: `${formatNumber(entries.length)} in total`,
            ...(className ? { className } : {}),
        },
        renderExpandableList(
            sorted,
            TOP_LIST_COLLAPSED,
            id,
            state,
            controller,
            (shown) =>
                shown.length === 0
                    ? renderEmpty('Nothing here yet.')
                    : renderBarList(
                          toChartItems(shown, state.filter.facets, metric),
                          {
                              label: title,
                              onSelect: (item: ChartItem) => {
                                  controller.toggleFacet(facetFromItem(item));
                              },
                              ranked: true,
                          },
                      ),
        ),
    );
}
