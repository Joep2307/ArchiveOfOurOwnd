import { el } from './el';

/** A page section with a heading and a grid of panels. */
export function renderSection(
    id: string,
    title: string,
    ...panels: (Node | null)[]
): HTMLElement {
    return el(
        'section',
        { className: 'section', attrs: { id, 'aria-labelledby': `${id}-h` } },
        el('h2', {
            className: 'section__title',
            text: title,
            attrs: { id: `${id}-h` },
        }),
        el('div', { className: 'section__grid' }, ...panels),
    );
}
