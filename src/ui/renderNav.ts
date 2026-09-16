import { DASHBOARD_VIEWS, viewHash } from '@/app';
import { VIEW_LINKS } from './constants';
import { el } from './el';

/** Persistent menu that switches between pages. */
export function renderNav(): HTMLElement {
    return el(
        'nav',
        {
            className: 'reading-rail',
            attrs: { 'aria-label': 'Pages' },
        },
        el('a', {
            className: 'reading-rail__brand',
            text: 'A³',
            attrs: {
                href: viewHash('dashboard'),
                'aria-label': 'Reading Stats dashboard',
            },
        }),
        ...DASHBOARD_VIEWS.map((view) => {
            const { label, icon } = VIEW_LINKS[view];
            return el(
                'a',
                {
                    className: 'reading-rail__link',
                    attrs: {
                        href: viewHash(view),
                        title: label,
                        'aria-label': label,
                        'data-view': view,
                    },
                },
                el('span', { text: icon, attrs: { 'aria-hidden': true } }),
                el('span', { className: 'reading-rail__label', text: label }),
            );
        }),
        el('a', {
            className: 'reading-rail__archive',
            text: '↗',
            attrs: {
                href: 'https://archiveofourown.org',
                target: '_blank',
                rel: 'noopener noreferrer',
                'aria-label': 'Open AO3',
                title: 'Back to the Archive',
            },
        }),
    );
}
