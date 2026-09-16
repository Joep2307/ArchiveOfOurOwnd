import { formatNumber } from '@/format';
import type { NumberSummary } from '@/stats';
import { el } from './el';

export type SummaryColumn = {
    label: string;
    summary: NumberSummary;
};

const ROWS: [string, (s: NumberSummary) => number][] = [
    ['Average', (s) => s.mean],
    ['Median', (s) => s.median],
    ['Shortest / lowest', (s) => s.min],
    ['25th percentile', (s) => s.p25],
    ['75th percentile', (s) => s.p75],
    ['90th percentile', (s) => s.p90],
    ['Longest / highest', (s) => s.max],
    ['Standard deviation', (s) => s.stdDev],
];

/** Averages and percentiles side by side. */
export function renderSummaryTable(
    columns: readonly SummaryColumn[],
): HTMLElement {
    return el(
        'div',
        { className: 'table-scroll' },
        el(
            'table',
            { className: 'summary-table' },
            el(
                'thead',
                {},
                el(
                    'tr',
                    {},
                    el('th', { attrs: { scope: 'col' } }),
                    ...columns.map((column) =>
                        el('th', {
                            text: column.label,
                            attrs: { scope: 'col' },
                        }),
                    ),
                ),
            ),
            el(
                'tbody',
                {},
                ...ROWS.map(([label, read]) =>
                    el(
                        'tr',
                        {},
                        el('th', { text: label, attrs: { scope: 'row' } }),
                        ...columns.map((column) =>
                            el('td', {
                                text:
                                    read(column.summary) < 10 &&
                                    read(column.summary) % 1 !== 0
                                        ? read(column.summary).toFixed(1)
                                        : formatNumber(read(column.summary)),
                            }),
                        ),
                    ),
                ),
            ),
        ),
    );
}
