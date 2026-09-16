import type { Work } from '@/model';
import { el } from './el';
import { workUrl } from './workUrl';

/** Title linking to AO3 (opens in a new tab). */
export function renderWorkTitle(work: Work): HTMLElement {
    const url = workUrl(work);
    if (!url || work.kind !== 'work') {
        return el('span', {
            className: 'work-title is-muted',
            text: work.title,
        });
    }
    return el('a', {
        className: 'work-title',
        text: work.title,
        attrs: { href: url, target: '_blank', rel: 'noopener noreferrer' },
    });
}
