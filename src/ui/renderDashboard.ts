import type { DashboardController, DashboardState } from '@/app';
import type { Work } from '@/model';
import type { Stats, StatsCore } from '@/stats';
import { computeStats, filterWorks } from '@/stats';
import { el } from './el';
import type { FilterBar } from './FilterBar';
import { renderDistributions } from './renderDistributions';
import { renderHeader } from './renderHeader';
import { renderNav } from './renderNav';
import { renderOverview } from './renderOverview';
import { renderStandouts } from './renderStandouts';
import { renderSyncBanner } from './renderSyncBanner';
import { renderTimeline } from './renderTimeline';
import { renderTopLists } from './renderTopLists';
import { renderWelcome } from './renderWelcome';
import { renderWorksTable } from './renderWorksTable';

export type DashboardParts = {
    header: HTMLElement;
    banner: HTMLElement;
    filterBar: FilterBar;
    main: HTMLElement;
};

type Cache = {
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
            cache.filter !== state.filter
        ) {
            cache.works = works;
            cache.filter = state.filter;
            cache.matching = filterWorks(works, state.filter, now());
            cache.stats = computeStats(cache.matching, core);
        }
        return [cache.matching, cache.stats];
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
        parts.main.replaceChildren(
            renderNav(),
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
