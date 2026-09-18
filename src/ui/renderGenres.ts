import { formatNumber } from '@/format';
import type { CountEntry } from '@/stats';
import type { ChartItem } from './charts';
import { renderBarList } from './charts';
import { el } from './el';
import { facetFromItem } from './facetFromItem';
import { renderEmpty } from './renderEmpty';
import { renderExpandableList } from './renderExpandableList';
import { renderPanel } from './renderPanel';
import { renderRankTools } from './renderRankTools';
import { renderSection } from './renderSection';
import { renderStatTile } from './renderStatTile';
import { renderTopList } from './renderTopList';
import { toChartItems } from './toChartItems';
import type { ViewContext } from './ViewContext';

const MAX_ROWS = 8;

function share(part: number, whole: number): string {
    return whole > 0 ? `${Math.round((part / whole) * 100)}%` : '—';
}

/**
 * Genre stats. AO3 has no genre field, so genres are the tags authors
 * add, next to rating, pairing type and warnings.
 */
export function renderGenres(context: ViewContext): HTMLElement {
    const { state, stats, controller } = context;
    const facets = state.filter.facets;
    const works = stats.totals.works;
    const select = (item: ChartItem): void => {
        controller.toggleFacet(facetFromItem(item));
    };
    const bars = (
        entries: CountEntry[],
        label: string,
        empty: string,
    ): HTMLElement =>
        renderExpandableList(
            entries,
            MAX_ROWS,
            `genres-${label}`,
            state,
            controller,
            (shown) =>
                shown.length === 0
                    ? renderEmpty(empty)
                    : renderBarList(toChartItems(shown, facets), {
                          label,
                          onSelect: select,
                      }),
        );

    const [top, second] = stats.freeforms;
    const ratings = stats.ratings.filter(
        (entry) => entry.works > 0 || entry.value !== 'Not Rated',
    );
    const [topRating] = [...ratings].sort((a, b) => b.works - a.works);

    const section = renderSection(
        'genres',
        'Genres',
        renderTopList(
            context,
            'top-tags',
            'Top genres and tags',
            stats.freeforms,
            'panel--wide',
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
            { title: 'Archive warnings' },
            bars(stats.warnings, 'Works per warning', 'None shown.'),
        ),
        renderPanel(
            { title: 'Languages' },
            bars(stats.languages, 'Works per language', 'None yet.'),
        ),
    );
    section.querySelector('.section__title')?.after(
        el('p', {
            className: 'section__lead',
            text:
                'AO3 has no single genre field, so genres here are the ' +
                'tags authors add to their works (fluff, angst, AU…), ' +
                'next to rating and pairing type.',
        }),
        el(
            'div',
            { className: 'tiles tiles--compact' },
            renderStatTile(
                'Top genre',
                top?.label ?? '—',
                top
                    ? `${formatNumber(top.works)} works · ` +
                          `${share(top.works, works)} of what you read`
                    : undefined,
            ),
            renderStatTile(
                'Runner-up',
                second?.label ?? '—',
                second ? `${formatNumber(second.works)} works` : undefined,
            ),
            renderStatTile(
                'Different tags',
                formatNumber(stats.totals.tags),
                `across ${formatNumber(works)} works`,
            ),
            renderStatTile(
                'Most read rating',
                topRating?.label ?? '—',
                topRating
                    ? `${share(topRating.works, works)} of works`
                    : undefined,
            ),
        ),
        renderRankTools(context),
    );
    return section;
}
