import type { CountEntry, Facet, RankMetric } from '@/stats';
import { formatNumber } from '@/format';
import type { ChartItem } from './charts';

/** Maps counted rows to chart items, marking active filters. */
export function toChartItems(
    entries: readonly CountEntry[],
    facets: readonly Facet[],
    metric: RankMetric = 'works',
    shortLabel?: (entry: CountEntry) => string,
): ChartItem[] {
    return entries.map((entry) => ({
        id: `${entry.field}:${entry.value}`,
        label: entry.label,
        ...(shortLabel ? { shortLabel: shortLabel(entry) } : {}),
        value: entry[metric],
        display: formatNumber(entry[metric]),
        details: [
            { label: 'Works', value: formatNumber(entry.works) },
            { label: 'Words', value: formatNumber(entry.words) },
            { label: 'Visits', value: formatNumber(entry.visits) },
        ],
        active: facets.some(
            (facet) =>
                facet.field === entry.field && facet.value === entry.value,
        ),
    }));
}
