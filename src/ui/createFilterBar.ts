import type { DashboardController, DashboardState } from '@/app';
import { formatNumber } from '@/format';
import type { Period } from '@/stats';
import { el } from './el';
import { facetLabel } from './facetLabel';
import type { FilterBar } from './FilterBar';

const SEARCH_DELAY_MS = 200;

function periodOptions(state: DashboardState): [Period, string][] {
    const years = new Set<string>();
    for (const work of state.library?.works ?? []) {
        if (work.lastVisited) {
            years.add(work.lastVisited.slice(0, 4));
        }
    }
    return [
        ['all', 'All time'],
        ['last30', 'Last 30 days'],
        ['last365', 'Last 12 months'],
        ...[...years]
            .sort()
            .reverse()
            .map((year): [Period, string] => [`year:${year}`, year]),
    ];
}

/** Search box, period picker and active filter chips. */
export function createFilterBar(controller: DashboardController): FilterBar {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let optionsKey = '';

    const search = el('input', {
        className: 'input input--search',
        attrs: {
            type: 'search',
            placeholder: 'Search titles, authors, tags…',
            'aria-label': 'Search works',
        },
        on: {
            input: () => {
                clearTimeout(timer);
                timer = setTimeout(() => {
                    controller.setQuery(search.value);
                }, SEARCH_DELAY_MS);
            },
        },
    });
    const period = el('select', {
        className: 'input',
        attrs: { 'aria-label': 'Time period' },
        on: {
            change: () => {
                controller.setPeriod(period.value as Period);
            },
        },
    });
    const chips = el('ul', {
        className: 'chips',
        attrs: { 'aria-label': 'Active filters' },
    });
    const count = el('p', {
        className: 'filter-bar__count',
        attrs: { 'aria-live': 'polite' },
    });

    const element = el(
        'div',
        { className: 'filter-bar', attrs: { role: 'search' } },
        el(
            'div',
            { className: 'filter-bar__inner' },
            search,
            period,
            chips,
            count,
        ),
    );

    return {
        element,
        update(state, matching, total) {
            const { filter } = state;
            if (document.activeElement !== search) {
                search.value = filter.query;
            }
            const options = periodOptions(state);
            const key = options.map(([id]) => id).join();
            if (key !== optionsKey) {
                optionsKey = key;
                period.replaceChildren(
                    ...options.map(([id, label]) =>
                        el('option', { text: label, attrs: { value: id } }),
                    ),
                );
            }
            period.value = filter.period;

            const active =
                filter.facets.length > 0 ||
                filter.query !== '' ||
                filter.period !== 'all';
            chips.replaceChildren(
                ...filter.facets.map((facet) =>
                    el(
                        'li',
                        {},
                        el(
                            'button',
                            {
                                className: 'chip',
                                attrs: {
                                    type: 'button',
                                    'aria-label':
                                        'Remove filter ' + facetLabel(facet),
                                },
                                on: {
                                    click: () => {
                                        controller.removeFacet(facet);
                                    },
                                },
                            },
                            facetLabel(facet),
                            el('span', {
                                className: 'chip__x',
                                text: '×',
                                attrs: { 'aria-hidden': true },
                            }),
                        ),
                    ),
                ),
                active
                    ? el(
                          'li',
                          {},
                          el('button', {
                              className: 'link-button',
                              text: 'Clear all',
                              attrs: { type: 'button' },
                              on: {
                                  click: () => {
                                      search.value = '';
                                      controller.clearFilters();
                                  },
                              },
                          }),
                      )
                    : '',
            );
            count.textContent = active
                ? `${formatNumber(matching)} of ${formatNumber(total)} entries`
                : `${formatNumber(total)} entries`;
        },
    };
}
