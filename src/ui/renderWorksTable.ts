import { sortWorks, type SortKey } from '@/app';
import { formatDate, formatNumber, plural } from '@/format';
import type { Work } from '@/model';
import { authorLabel } from './authorLabel';
import { el } from './el';
import { renderEmpty } from './renderEmpty';
import { renderPanel } from './renderPanel';
import { renderSection } from './renderSection';
import { renderWorkTitle } from './renderWorkTitle';
import { reviewControl } from './renderWorkList';
import type { ViewContext } from './ViewContext';

const PAGE_SIZE = 50;

type Column = {
    key: SortKey | null;
    label: string;
    numeric?: boolean;
    /** Label for screen readers only. */
    hiddenLabel?: boolean;
    className?: string;
    cell: (work: Work, context: ViewContext) => Node | string;
};

const RATING_SHORT: Record<string, string> = {
    'General Audiences': 'G',
    'Teen And Up Audiences': 'T',
    Mature: 'M',
    Explicit: 'E',
    'Not Rated': '—',
};

const COLUMNS: Column[] = [
    {
        key: 'title',
        label: 'Title',
        cell: (work) =>
            el(
                'div',
                { className: 'cell-title' },
                renderWorkTitle(work),
                el('span', { className: 'muted', text: authorLabel(work) }),
            ),
    },
    {
        key: 'fandom',
        label: 'Fandom',
        cell: (work) => work.fandoms.join(', ') || '—',
    },
    {
        key: null,
        label: 'Rating',
        cell: (work) =>
            el('abbr', {
                className: 'rating-badge',
                text: RATING_SHORT[work.rating] ?? '—',
                attrs: { title: work.rating },
            }),
    },
    {
        key: 'words',
        label: 'Words',
        numeric: true,
        cell: (work) =>
            work.kind === 'work' ? formatNumber(work.words) : '—',
    },
    {
        key: null,
        label: 'Chapters',
        numeric: true,
        cell: (work) =>
            work.kind === 'work'
                ? `${work.chaptersPosted}/${work.chaptersTotal ?? '?'}`
                : '—',
    },
    {
        key: 'kudos',
        label: 'Kudos',
        numeric: true,
        cell: (work) => formatNumber(work.kudos),
    },
    {
        key: 'visits',
        label: 'Visits',
        numeric: true,
        cell: (work, { state }) => {
            const review = state.library?.reviews?.[work.key];
            const visits =
                review?.status === 'finished'
                    ? (review.readCount ?? 1)
                    : work.visits;
            return formatNumber(visits);
        },
    },
    {
        key: 'lastVisited',
        label: 'Last visited',
        cell: (work) => formatDate(work.lastVisited),
    },
    {
        key: null,
        label: 'Review',
        hiddenLabel: true,
        className: 'is-action',
        cell: (work, { state, controller }) =>
            work.kind === 'work'
                ? reviewControl(work, state, controller)
                : '—',
    },
    {
        key: null,
        label: 'Remove',
        hiddenLabel: true,
        className: 'is-action',
        cell: (work, { state, controller }) =>
            el('button', {
                className: 'remove-button',
                text: '×',
                attrs: {
                    type: 'button',
                    title: 'Remove from your stats',
                    'aria-label': `Remove ${work.title}`,
                    disabled: state.sync.running,
                },
                on: {
                    click: () => void controller.removeWork(work),
                },
            }),
    },
];

function cellClass(column: Column): string {
    return [column.numeric ? 'is-numeric' : '', column.className ?? '']
        .filter(Boolean)
        .join(' ');
}

/** Every matching work, sortable and paged. */
export function renderWorksTable(
    context: ViewContext,
    works: readonly Work[],
): HTMLElement {
    const { state, controller } = context;
    const { sort, descending } = state.table;
    const pages = Math.max(1, Math.ceil(works.length / PAGE_SIZE));
    const page = Math.min(state.table.page, pages - 1);
    const rows = sortWorks(works, sort, descending).slice(
        page * PAGE_SIZE,
        (page + 1) * PAGE_SIZE,
    );

    const head = el(
        'tr',
        {},
        ...COLUMNS.map((column) => {
            const current = column.key === sort;
            const ariaSort = current
                ? descending
                    ? 'descending'
                    : 'ascending'
                : undefined;
            const content = column.key
                ? el(
                      'button',
                      {
                          className: 'sort-button',
                          attrs: { type: 'button' },
                          on: {
                              click: () => {
                                  if (column.key) {
                                      controller.sortBy(column.key);
                                  }
                              },
                          },
                      },
                      column.label,
                      el('span', {
                          className: 'sort-button__arrow',
                          text: current ? (descending ? '↓' : '↑') : '',
                          attrs: { 'aria-hidden': true },
                      }),
                  )
                : column.hiddenLabel
                  ? el('span', {
                        className: 'visually-hidden',
                        text: column.label,
                    })
                  : column.label;
            return el(
                'th',
                {
                    className: cellClass(column),
                    attrs: { scope: 'col', 'aria-sort': ariaSort },
                },
                content,
            );
        }),
    );

    const body = el(
        'tbody',
        {},
        ...rows.map((work) =>
            el(
                'tr',
                {},
                ...COLUMNS.map((column) =>
                    el(
                        'td',
                        { className: cellClass(column) },
                        column.cell(work, context),
                    ),
                ),
            ),
        ),
    );

    const pager =
        pages > 1
            ? el(
                  'nav',
                  { className: 'pager', attrs: { 'aria-label': 'Pages' } },
                  el('button', {
                      className: 'button button--ghost',
                      text: '← Previous',
                      attrs: { type: 'button', disabled: page === 0 },
                      on: {
                          click: () => {
                              controller.setPage(page - 1);
                          },
                      },
                  }),
                  el('span', {
                      className: 'muted',
                      text: `Page ${page + 1} of ${pages}`,
                  }),
                  el('button', {
                      className: 'button button--ghost',
                      text: 'Next →',
                      attrs: {
                          type: 'button',
                          disabled: page >= pages - 1,
                      },
                      on: {
                          click: () => {
                              controller.setPage(page + 1);
                          },
                      },
                  }),
              )
            : null;

    return renderSection(
        'works',
        'All works',
        renderPanel(
            {
                title: plural(works.length, 'entry', 'entries'),
                subtitle:
                    'Click a column heading to sort. × removes a work ' +
                    'from your stats.',
                className: 'panel--full',
            },
            works.length === 0
                ? renderEmpty('No works match these filters.')
                : el(
                      'div',
                      { className: 'table-scroll' },
                      el(
                          'table',
                          { className: 'works-table' },
                          el('thead', {}, head),
                          body,
                      ),
                  ),
            pager,
        ),
    );
}
