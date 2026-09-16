import type { DashboardController, DashboardState, SortKey } from '@/app';
import { formatNumber } from '@/format';
import type { Period } from '@/stats';
import { el } from './el';
import { facetLabel } from './facetLabel';
import type { FilterBar } from './FilterBar';

const SEARCH_DELAY_MS = 200;

/** Shown when the table is sorted in a way the picker doesn't list. */
const CUSTOM_SORT = 'custom';

const SORT_OPTIONS: [SortKey, boolean, string][] = [
    ['lastVisited', true, 'Recently visited'],
    ['words', true, 'Longest first'],
    ['words', false, 'Shortest first'],
    ['kudos', true, 'Most kudos'],
    ['visits', true, 'Most visits'],
    ['title', false, 'Title A–Z'],
];

function sortValue(key: SortKey, descending: boolean): string {
    return `${key}:${descending ? 'desc' : 'asc'}`;
}

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

/** Search box, period and sort pickers and active filter chips. */
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
    const sort = el(
        'select',
        {
            className: 'input',
            attrs: { 'aria-label': 'Sort works' },
            on: {
                change: () => {
                    const option = SORT_OPTIONS.find(
                        ([key, descending]) =>
                            sortValue(key, descending) === sort.value,
                    );
                    if (option) {
                        controller.setSort(option[0], option[1]);
                        document
                            .getElementById('works')
                            ?.scrollIntoView({ block: 'start' });
                    }
                },
            },
        },
        ...SORT_OPTIONS.map(([key, descending, label]) =>
            el('option', {
                text: label,
                attrs: { value: sortValue(key, descending) },
            }),
        ),
        el('option', {
            text: 'Custom order',
            attrs: { value: CUSTOM_SORT, hidden: true, disabled: true },
        }),
    );
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
            sort,
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

            const current = sortValue(
                state.table.sort,
                state.table.descending,
            );
            sort.value = SORT_OPTIONS.some(
                ([key, descending]) => sortValue(key, descending) === current,
            )
                ? current
                : CUSTOM_SORT;

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
