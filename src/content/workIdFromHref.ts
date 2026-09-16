import { AO3_ORIGIN } from '@/parse';
import { WORK_PATH } from './constants';

/**
 * AO3 work id a link points to, or `null`. Only the work itself and
 * its chapters count, not its bookmarks, comments or edit pages.
 */
export function workIdFromHref(href: string): number | null {
    let url: URL;
    try {
        url = new URL(href, AO3_ORIGIN);
    } catch {
        return null;
    }
    if (url.origin !== AO3_ORIGIN) {
        return null;
    }
    const match = WORK_PATH.exec(url.pathname);
    return match ? Number(match[1]) : null;
}
