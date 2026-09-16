import { formatNumber } from '@/format';
import { el } from '../el';
import type { ChartItem } from './ChartItem';
import { withTooltip } from './withTooltip';

export type SplitBarOptions = {
    label: string;
    onSelect?: (item: ChartItem) => void;
};

/**
 * One stacked bar showing parts of a whole (max 4 parts), with a
 * legend underneath.
 */
export function renderSplitBar(
    items: readonly ChartItem[],
    options: SplitBarOptions,
): HTMLElement {
    const total = items.reduce((sum, item) => sum + item.value, 0) || 1;
    const bar = el('div', {
        className: 'split__bar',
        attrs: { role: 'img', 'aria-label': options.label },
    });
    const legend = el('ul', { className: 'split__legend' });
    items.forEach((item, index) => {
        const share = (item.value / total) * 100;
        if (item.value > 0) {
            bar.append(
                withTooltip(
                    el('span', {
                        className: `split__part series-${index + 1}`,
                        attrs: { style: `--value: ${share}` },
                    }),
                    item.label,
                    item.details,
                ),
            );
        }
        legend.append(
            el(
                'li',
                {},
                el(
                    'button',
                    {
                        className: `split__key${
                            item.active ? ' is-active' : ''
                        }`,
                        attrs: {
                            type: 'button',
                            'aria-pressed': item.active ? 'true' : 'false',
                            disabled: !options.onSelect,
                        },
                        on: { click: () => options.onSelect?.(item) },
                    },
                    el('span', {
                        className: `split__swatch series-${index + 1}`,
                        attrs: { 'aria-hidden': true },
                    }),
                    el('span', { text: item.label }),
                    el('strong', {
                        text: `${Math.round(share)}%`,
                    }),
                    el('span', {
                        className: 'muted',
                        text: formatNumber(item.value),
                    }),
                ),
            ),
        );
    });
    return el('div', { className: 'split' }, bar, legend);
}
