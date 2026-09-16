import {
    viewFromHash,
    type DashboardController,
    type DashboardState,
    type Store,
} from '@/app';
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
        nav: renderNav(),
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
        main: el('main', {
            className: 'page',
            attrs: { id: 'main', tabindex: -1 },
        }),
    };
    root.replaceChildren(
        el('a', {
            className: 'skip-link',
            text: 'Skip to content',
            attrs: { href: '#main' },
        }),
        parts.nav,
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
    const onHashChange = (): void => {
        const view = viewFromHash(window.location.hash);
        if (view !== null && view !== store.get().view) {
            controller.showView(view);
            window.scrollTo({ top: 0 });
            parts.main.focus({ preventScroll: true });
        }
    };
    window.addEventListener('hashchange', onHashChange);

    render(store.get());
    const unsubscribe = store.subscribe(schedule);
    return () => {
        unsubscribe();
        window.removeEventListener('hashchange', onHashChange);
    };
}
