import { el } from './el';

const LINKS: [string, string][] = [
    ['overview', 'Overview'],
    ['time', 'Over time'],
    ['shape', 'What you read'],
    ['people', 'Favourites'],
    ['standouts', 'Standouts'],
    ['works', 'All works'],
];

/** In-page jump links. */
export function renderNav(): HTMLElement {
    return el(
        'nav',
        { className: 'jump-nav', attrs: { 'aria-label': 'Sections' } },
        ...LINKS.map(([id, label]) =>
            el('a', { text: label, attrs: { href: `#${id}` } }),
        ),
    );
}
