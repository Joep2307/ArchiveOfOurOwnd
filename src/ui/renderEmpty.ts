import { el } from './el';

/** Placeholder text inside a panel with nothing to show. */
export function renderEmpty(text: string): HTMLElement {
    return el('p', { className: 'empty', text });
}
