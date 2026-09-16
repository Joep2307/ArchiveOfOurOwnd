import type { DashboardView } from '@/app';

/** Highlights the menu link of the open page. */
export function markActiveView(nav: HTMLElement, view: DashboardView): void {
    for (const link of nav.querySelectorAll<HTMLElement>('[data-view]')) {
        if (link.dataset.view === view) {
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    }
}
