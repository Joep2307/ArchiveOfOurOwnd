import type { DashboardController, DashboardState, Store } from '@/app';
import type { StatsCore } from '@/stats';
import { createFilterBar } from './createFilterBar';
import { el } from './el';
import { renderNav } from './renderNav';
import { createDashboardRenderer } from './renderDashboard';

/** Builds the page skeleton and re-renders on every change. */
export function mountDashboard(
    root: HTMLElement,
    store: Store<DashboardState>,
    controller: DashboardController,
    core: StatsCore,
    now: () => Date,
): () => void {
    const parts = {
        review: el('dialog', {
            className: 'review-dialog',
            attrs: { 'aria-labelledby': 'reading-review-h' },
            on: {
                cancel: (event) => {
                    event.preventDefault();
                    controller.setReviewOpen(false);
                },
            },
        }),
        header: el('div', { className: 'header-slot' }),
        banner: el('div', { className: 'banner-slot page' }),
        filterBar: createFilterBar(controller),
        main: el('main', { className: 'page', attrs: { id: 'main' } }),
    };
    root.replaceChildren(
        el('a', {
            className: 'skip-link',
            text: 'Skip to content',
            attrs: { href: '#main' },
        }),
        renderNav(),
        parts.header,
        parts.banner,
        parts.filterBar.element,
        parts.main,
        parts.review,
    );

    const render = createDashboardRenderer(parts, controller, core, now);
    let frame = 0;
    const schedule = (): void => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
            render(store.get());
        });
    };
    render(store.get());
    return store.subscribe(schedule);
}
