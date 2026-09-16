import { el } from './el';

/** A big number with a label and an optional note. */
export function renderStatTile(
    label: string,
    value: string,
    note?: string,
): HTMLElement {
    return el(
        'div',
        { className: 'tile' },
        el('p', { className: 'tile__label', text: label }),
        el('p', { className: 'tile__value', text: value }),
        note ? el('p', { className: 'tile__note', text: note }) : null,
    );
}
