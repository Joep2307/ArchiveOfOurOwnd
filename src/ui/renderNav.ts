import { el } from './el';

const LINKS: [string, string, string][] = [
    ['overview', 'Overview', '◈'],
    ['time', 'Over time', '◷'],
    ['shape', 'What you read', '▥'],
    ['people', 'Favourites', '♡'],
    ['standouts', 'Standouts', '✦'],
    ['works', 'All works', '▤'],
];

/** Persistent reading-room navigation with accessible labels. */
export function renderNav(): HTMLElement {
    return el(
        'nav',
        {
            className: 'reading-rail',
            attrs: { 'aria-label': 'Sections' },
        },
        el('a', {
            className: 'reading-rail__brand',
            text: 'A³',
            attrs: { href: '#main', 'aria-label': 'Reading Stats home' },
        }),
        ...LINKS.map(([id, label, icon]) =>
            el(
                'a',
                {
                    attrs: {
                        href: `#${id}`,
                        title: label,
                        'aria-label': label,
                    },
                },
                el('span', { text: icon, attrs: { 'aria-hidden': true } }),
                el('span', { className: 'reading-rail__label', text: label }),
            ),
        ),
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
