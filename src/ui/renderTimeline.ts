import { formatNumber } from '@/format';
import { MONTH_LABELS } from '@/stats';
import type { ChartItem } from './charts';
import { renderColumnChart } from './charts';
import { facetFromItem } from './facetFromItem';
import { renderEmpty } from './renderEmpty';
import { renderPanel } from './renderPanel';
import { renderSection } from './renderSection';
import { renderToggle } from './renderToggle';
import { toChartItems } from './toChartItems';
import type { ViewContext } from './ViewContext';

const BY_YEAR = 'timeline-years';

/** Works per month (or year) of last visit. */
export function renderTimeline(context: ViewContext): HTMLElement {
    const { state, stats, controller } = context;
    const byYear = state.expanded[BY_YEAR] === true;
    const facets = state.filter.facets;

    const few = stats.timeline.length <= 18;
    const monthTick = (month: string): string => {
        if (month.endsWith('-01')) {
            return month.slice(0, 4);
        }
        return few ? (MONTH_LABELS[Number(month.slice(5)) - 1] ?? '') : '';
    };
    const items: ChartItem[] = byYear
        ? toChartItems(stats.visitedYears, facets)
        : stats.timeline.map((point) => ({
              id: `visitedMonth:${point.month}`,
              label: point.label,
              shortLabel: monthTick(point.month),
              value: point.works,
              display: formatNumber(point.works),
              details: [
                  { label: 'Works', value: formatNumber(point.works) },
                  { label: 'Words', value: formatNumber(point.words) },
              ],
              active: facets.some(
                  (f) => f.field === 'visitedMonth' && f.value === point.month,
              ),
          }));

    const chart =
        items.length === 0
            ? renderEmpty('No visit dates yet.')
            : renderColumnChart(items, {
                  label: byYear ? 'Works per year' : 'Works per month',
                  onSelect: (item) => {
                      controller.toggleFacet(facetFromItem(item));
                  },
                  labelEvery: 1,
              });

    return renderSection(
        'time',
        'Over time',
        renderPanel(
            {
                title: byYear ? 'Works per year' : 'Works per month',
                subtitle:
                    'Grouped by the date you last opened each work. ' +
                    'AO3 only keeps your most recent visit, so ' +
                    're-reads count once, in their latest month.',
                className: 'panel--full',
                actions: renderToggle(
                    'Group by',
                    [
                        { id: 'month', label: 'Months' },
                        { id: 'year', label: 'Years' },
                    ],
                    byYear ? 'year' : 'month',
                    (id) => {
                        if ((id === 'year') !== byYear) {
                            controller.toggleExpanded(BY_YEAR);
                        }
                    },
                ),
            },
            chart,
        ),
    );
}
