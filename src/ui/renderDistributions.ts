import { formatNumber } from '@/format';
import { renderColumnChart, renderSplitBar, type ChartItem } from './charts';
import { facetFromItem } from './facetFromItem';
import { renderEmpty } from './renderEmpty';
import { renderPanel } from './renderPanel';
import { renderSection } from './renderSection';
import { renderSummaryTable } from './renderSummaryTable';
import { toChartItems } from './toChartItems';
import type { ViewContext } from './ViewContext';

/** Status, length, averages and year last updated. */
export function renderDistributions(context: ViewContext): HTMLElement {
    const { state, stats, controller } = context;
    const facets = state.filter.facets;
    const select = (item: ChartItem): void => {
        controller.toggleFacet(facetFromItem(item));
    };
    return renderSection(
        'shape',
        'Length & status',
        renderPanel(
            { title: 'Complete or in progress' },
            stats.totals.works === 0
                ? renderEmpty('No readable works.')
                : renderSplitBar(toChartItems(stats.status, facets), {
                      label: 'Complete versus in progress',
                      onSelect: select,
                  }),
        ),
        renderPanel(
            {
                title: 'Length',
                subtitle: 'Works per word count.',
                className: 'panel--wide',
            },
            renderColumnChart(toChartItems(stats.wordBuckets, facets), {
                label: 'Works per word count',
                onSelect: select,
                labelEvery: 1,
            }),
        ),
        renderPanel(
            {
                title: 'Averages',
                subtitle:
                    `Across ${formatNumber(stats.totals.works)} ` +
                    'readable works.',
                className: 'panel--full',
            },
            renderSummaryTable([
                { label: 'Words', summary: stats.wordSummary },
                { label: 'Chapters', summary: stats.chapterSummary },
                { label: 'Your visits', summary: stats.visitSummary },
                { label: 'Kudos', summary: stats.kudosSummary },
            ]),
        ),
        renderPanel(
            {
                title: 'Year last updated',
                subtitle: 'When the author last posted to the work.',
                className: 'panel--full',
            },
            stats.updatedYears.length === 0
                ? renderEmpty('No dates yet.')
                : renderColumnChart(
                      toChartItems(
                          stats.updatedYears,
                          facets,
                          'works',
                          (entry) => `’${entry.value.slice(2)}`,
                      ),
                      {
                          label: 'Works per year last updated',
                          onSelect: select,
                          labelEvery: 1,
                      },
                  ),
        ),
    );
}
