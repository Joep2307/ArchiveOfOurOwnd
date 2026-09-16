import { el } from '../el';
import type { ChartItem } from './ChartItem';
import { withTooltip } from './withTooltip';

export type BarListOptions = {
    onSelect?: (item: ChartItem) => void;
    /** Accessible name of the list. */
    label: string;
    /** Scale max; defaults to the largest value. */
    max?: number;
    /** Show a rank number before each row. */
    ranked?: boolean;
};

/** Horizontal bars with labels and values; rows are buttons. */
export function renderBarList(
    items: readonly ChartItem[],
    options: BarListOptions,
): HTMLElement {
    const max = options.max ?? Math.max(1, ...items.map((item) => item.value));
    const list = el('ol', {
        className: `bar-list${options.ranked ? ' bar-list--ranked' : ''}`,
        attrs: { 'aria-label': options.label },
    });
    items.forEach((item, index) => {
        const width = Math.max(0, (item.value / max) * 100);
        const button = el(
            'button',
            {
                className: `bar-list__row${item.active ? ' is-active' : ''}`,
                attrs: {
                    type: 'button',
                    'aria-pressed': item.active ? 'true' : 'false',
                    'aria-label': `${item.label}: ${item.display}`,
                    disabled: !options.onSelect,
                },
                on: {
                    click: () => options.onSelect?.(item),
                },
            },
            options.ranked
                ? el('span', {
                      className: 'bar-list__rank',
                      text: String(index + 1),
                  })
                : null,
            el('span', { className: 'bar-list__label', text: item.label }),
            el(
                'span',
                {
                    className: 'bar-list__track',
                    attrs: { 'aria-hidden': true },
                },
                el('span', {
                    className: 'bar-list__bar',
                    attrs: { style: `--value: ${width.toFixed(2)}%` },
                }),
            ),
            el('span', { className: 'bar-list__value', text: item.display }),
        );
        list.append(
            el('li', {}, withTooltip(button, item.label, item.details)),
        );
    });
    return list;
}
