import type { DashboardController, DashboardState } from '@/app';
import type { Work } from '@/model';
import type { Library } from '@/model';
import type { Stats, StatsCore } from '@/stats';
import { computeStats, filterWorks } from '@/stats';
import { el } from './el';
import type { FilterBar } from './FilterBar';
import { renderDistributions } from './renderDistributions';
import { renderHeader } from './renderHeader';
import { renderReadingHero } from './renderReadingHero';
import { renderReadingReview } from './renderReadingReview';
import { renderOverview } from './renderOverview';
import { renderStandouts } from './renderStandouts';
import { renderSyncBanner } from './renderSyncBanner';
import { renderTimeline } from './renderTimeline';
import { renderTopLists } from './renderTopLists';
import { renderWelcome } from './renderWelcome';
import { renderWorksTable } from './renderWorksTable';

export type DashboardParts = {
    review: HTMLDialogElement;
    header: HTMLElement;
    banner: HTMLElement;
    filterBar: FilterBar;
    main: HTMLElement;
};

type Cache = {
    reviews: Library['reviews'];
    works: readonly Work[] | null;
    filter: DashboardState['filter'] | null;
    matching: Work[];
    stats: Stats | null;
};

/** Renders the whole page for one state. */
export function createDashboardRenderer(
    parts: DashboardParts,
    controller: DashboardController,
    core: StatsCore,
    now: () => Date,
): (state: DashboardState) => void {
    const cache: Cache = {
        reviews: undefined,
        works: null,
        filter: null,
        matching: [],
        stats: null,
    };

    const statsFor = (state: DashboardState): [Work[], Stats] => {
        const works = state.library?.works ?? [];
        if (
            cache.stats === null ||
            cache.works !== works ||
            cache.reviews !== state.library?.reviews ||
            cache.filter !== state.filter
        ) {
            cache.works = works;
            cache.reviews = state.library?.reviews;
            cache.filter = state.filter;
            cache.matching = filterWorks(works, state.filter, now());
            cache.stats = computeStats(cache.matching, core, cache.reviews);
        }
        return [cache.matching, cache.stats];
    };

    const closeReview = (): void => {
        if (parts.review.open) {
            parts.review.close();
            parts.header.querySelector<HTMLElement>('summary')?.focus();
        }
    };

    return (state) => {
        const theme = document.documentElement;
        if (state.theme === 'system') {
            theme.removeAttribute('data-theme');
        } else {
            theme.setAttribute('data-theme', state.theme);
        }

        parts.header.replaceChildren(renderHeader(state, controller, now()));
        const banner = renderSyncBanner(state, controller);
        parts.banner.replaceChildren(...(banner ? [banner] : []));

        if (!state.reviewOpen || !state.library?.works.length) closeReview();

        if (state.library === undefined) {
            parts.filterBar.element.hidden = true;
            parts.main.replaceChildren(
                el('p', { className: 'loading', text: 'Loading…' }),
            );
            return;
        }
        if (state.library === null || state.library.works.length === 0) {
            parts.filterBar.element.hidden = true;
            parts.main.replaceChildren(renderWelcome(state, controller));
            return;
        }

        const [matching, stats] = statsFor(state);
        parts.filterBar.element.hidden = false;
        parts.filterBar.update(
            state,
            matching.length,
            state.library.works.length,
        );

        const context = { state, stats, controller };
        if (state.reviewOpen) {
            const historyOpen =
                parts.review.querySelector<HTMLDetailsElement>(
                    '.review-history',
                )?.open ?? false;
            const focusLabel = parts.review.contains(document.activeElement)
                ? document.activeElement?.getAttribute('aria-label')
                : null;
            const scrollTop = parts.review.scrollTop;
            parts.review.replaceChildren(
                el('button', {
                    className: 'button review-dialog__close',
                    text: 'Done / close',
                    attrs: { type: 'button', autofocus: true },
                    on: {
                        click: () => {
                            controller.setReviewOpen(false);
                        },
                    },
                }),
                renderReadingReview(context),
            );
            const history =
                parts.review.querySelector<HTMLDetailsElement>(
                    '.review-history',
                );
            if (history) history.open = historyOpen;
            if (!parts.review.open) parts.review.showModal();
            if (focusLabel) {
                const target = [
                    ...parts.review.querySelectorAll<HTMLElement>(
                        '[aria-label]',
                    ),
                ].find(
                    (node) => node.getAttribute('aria-label') === focusLabel,
                );
                target?.focus({ preventScroll: true });
            }
            parts.review.scrollTop = scrollTop;
        }
        parts.main.replaceChildren(
            renderReadingHero(state),
            renderOverview(stats),
            renderTimeline(context),
            renderDistributions(context),
            renderTopLists(context),
            renderStandouts(context),
            renderWorksTable(context, matching),
            el('footer', {
                className: 'footer',
                text:
                    'Unofficial fan-made tool, not affiliated with the ' +
                    'Organization for Transformative Works. Your ' +
                    'history stays in this browser.',
            }),
        );
    };
}
