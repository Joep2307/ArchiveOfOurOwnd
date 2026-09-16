import type { Work } from '@/model';
import { BADGE_CLASS } from './constants';
import { describeRead } from './describeRead';

/** Adds, updates or removes the "Read" badge at the end of `host`. */
export function setBadge(
    host: Element,
    read: boolean,
    work: Work | null,
): void {
    const existing = host.querySelector(`:scope > .${BADGE_CLASS}`);
    if (!read) {
        existing?.remove();
        return;
    }
    const title = describeRead(work);
    if (existing) {
        if (existing.getAttribute('title') !== title) {
            existing.setAttribute('title', title);
        }
        return;
    }
    const badge = host.ownerDocument.createElement('span');
    badge.className = BADGE_CLASS;
    badge.textContent = 'Read';
    badge.setAttribute('title', title);
    host.append(' ', badge);
}
