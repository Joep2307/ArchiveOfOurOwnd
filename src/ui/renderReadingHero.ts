import type { DashboardState } from '@/app';
import { el } from './el';

/** A welcoming introduction, grounded in the reader's own library. */
export function renderReadingHero(state: DashboardState): HTMLElement {
    return el(
        'div',
        { className: 'reading-hero' },
        el(
            'div',
            { className: 'reading-hero__eyebrow' },
            el('span', {
                className: 'reading-hero__badge',
                text: state.demo
                    ? '✦ A peek inside · demo library'
                    : '✦ From your archive',
            }),
            el('span', { text: 'All the stories that stayed with you.' }),
        ),
        el(
            'h2',
            {},
            `Hi, ${state.library?.username ?? 'reader'} — `,
            el('em', { text: 'just one more chapter.' }),
        ),
        el(
            'div',
            { className: 'reading-hero__bottom' },
            el('p', {
                text: 'Your fandoms. Your favourites. Your very good taste.',
            }),
            el('span', {
                className: 'reading-hero__tag',
                text: ' # My Reading Lore',
            }),
        ),
    );
}
