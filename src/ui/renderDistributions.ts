import { formatNumber } from '@/format';
import type { CountEntry } from '@/stats';
import {
    renderBarList,
    renderColumnChart,
    renderSplitBar,
    type ChartItem,
} from './charts';
import { facetFromItem } from './facetFromItem';
import { renderEmpty } from './renderEmpty';
import { renderPanel } from './renderPanel';
import { renderSection } from './renderSection';
import { renderSummaryTable } from './renderSummaryTable';
import { toChartItems } from './toChartItems';
import type { ViewContext } from './ViewContext';

const MAX_ROWS = 8;

/** Ratings, pairings, length, status, years, languages. */
export function renderDistributions(context: ViewContext): HTMLElement {
    const { state, stats, controller } = context;
    const facets = state.filter.facets;
    const select = (item: ChartItem): void => {
        controller.toggleFacet(facetFromItem(item));
    };
    const bars = (
        entries: CountEntry[],
        label: string,
        empty: string,
    ): HTMLElement =>
        entries.length === 0
            ? renderEmpty(empty)
            : renderBarList(toChartItems(entries.slice(0, MAX_ROWS), facets), {
                  label,
                  onSelect: select,
              });

    const ratings = stats.ratings.filter(
        (entry) => entry.works > 0 || entry.value !== 'Not Rated',
    );

    return renderSection(
        'shape',
        'What you read',
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
            { title: 'Ratings' },
            bars(ratings, 'Works per rating', 'No ratings yet.'),
        ),
        renderPanel(
            {
                title: 'Pairing categories',
                subtitle: 'A work can have several.',
            },
            bars(stats.categories, 'Works per category', 'None yet.'),
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
                className: 'panel--wide',
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
                className: 'panel--wide',
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
        renderPanel(
            { title: 'Languages' },
            bars(stats.languages, 'Works per language', 'None yet.'),
        ),
        renderPanel(
            { title: 'Archive warnings' },
            bars(stats.warnings, 'Works per warning', 'None shown.'),
        ),
    );
}
