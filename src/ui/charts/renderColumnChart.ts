import { formatCompact } from '@/format';
import { el } from '../el';
import type { ChartItem } from './ChartItem';
import { niceTicks } from './niceTicks';
import { withTooltip } from './withTooltip';

export type ColumnChartOptions = {
    label: string;
    onSelect?: (item: ChartItem) => void;
    /** Show every n-th axis label (auto when omitted). */
    labelEvery?: number;
};

/** Vertical columns on a shared baseline with gridlines. */
export function renderColumnChart(
    items: readonly ChartItem[],
    options: ColumnChartOptions,
): HTMLElement {
    const ticks = niceTicks(Math.max(0, ...items.map((i) => i.value)));
    const top = ticks.at(-1) ?? 1;
    const every =
        options.labelEvery ?? Math.max(1, Math.ceil(items.length / 12));

    const grid = el(
        'div',
        { className: 'columns__grid', attrs: { 'aria-hidden': true } },
        ...ticks.map((tick) =>
            el(
                'div',
                {
                    className: 'columns__gridline',
                    attrs: { style: `--value: ${(tick / top) * 100}%` },
                },
                el('span', { text: formatCompact(tick) }),
            ),
        ),
    );

    const plot = el('div', {
        className: 'columns__plot',
        attrs: { role: 'list', 'aria-label': options.label },
    });
    const axis = el('div', {
        className: 'columns__axis',
        attrs: { 'aria-hidden': true },
    });

    items.forEach((item, index) => {
        const height = (item.value / top) * 100;
        const column = el(
            'button',
            {
                className: `columns__col${item.active ? ' is-active' : ''}`,
                attrs: {
                    type: 'button',
                    role: 'listitem',
                    'aria-pressed': item.active ? 'true' : 'false',
                    'aria-label': `${item.label}: ${item.display}`,
                    disabled: !options.onSelect,
                },
                on: { click: () => options.onSelect?.(item) },
            },
            el('span', {
                className: 'columns__bar',
                attrs: {
                    style: `--value: ${height.toFixed(2)}%`,
                    'data-empty': item.value === 0 ? 'true' : undefined,
                },
            }),
        );
        plot.append(withTooltip(column, item.label, item.details));
        axis.append(
            el('span', {
                className: 'columns__tick',
                text:
                    index % every === 0 ? (item.shortLabel ?? item.label) : '',
            }),
        );
    });

    return el(
        'div',
        { className: 'columns' },
        el('div', { className: 'columns__area' }, grid, plot),
        axis,
    );
}
