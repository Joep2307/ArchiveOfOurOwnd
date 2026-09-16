import {
    BLURB_SELECTOR,
    BLURB_TITLE_SELECTOR,
    READ_CLASS,
    READ_LINK_CLASS,
    SKIP_LINKS_SELECTOR,
    WORK_TITLE_SELECTOR,
} from './constants';
import type { ReadIndex } from './ReadIndex';
import { setBadge } from './setBadge';
import { workIdFromHref } from './workIdFromHref';

/**
 * Marks every work on the page that is in `index`, and unmarks the
 * rest. Safe to call repeatedly: a second pass changes nothing.
 * `currentWorkId` is the work this page shows, if any.
 */
export function markReadWorks(
    doc: Document,
    index: ReadIndex,
    currentWorkId: number | null,
): void {
    for (const blurb of doc.querySelectorAll(BLURB_SELECTOR)) {
        const link = blurb.querySelector(BLURB_TITLE_SELECTOR);
        const id = workIdFromHref(link?.getAttribute('href') ?? '');
        const read = id !== null && index.has(id);
        blurb.classList.toggle(READ_CLASS, read);
        if (link?.parentElement) {
            setBadge(
                link.parentElement,
                read,
                read ? (index.get(id) ?? null) : null,
            );
        }
    }

    for (const link of doc.querySelectorAll('a[href]')) {
        if (link.closest(SKIP_LINKS_SELECTOR)) {
            continue;
        }
        const id = workIdFromHref(link.getAttribute('href') ?? '');
        const read = id !== null && id !== currentWorkId && index.has(id);
        link.classList.toggle(READ_LINK_CLASS, read);
    }

    const title = doc.querySelector(WORK_TITLE_SELECTOR);
    if (title && currentWorkId !== null) {
        const read = index.has(currentWorkId);
        setBadge(title, read, index.get(currentWorkId) ?? null);
    }
}
