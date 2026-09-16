import { parseLastPage } from './parseLastPage';
import { parseReadingBlurb } from './parseReadingBlurb';
import { parseUsername } from './parseUsername';
import type { ReadingsPage } from './ReadingsPage';

/**
 * Parses a history page. `page` is used to build stable keys for
 * deleted works, which have no id.
 */
export function parseReadingsPage(
    doc: Document,
    now: Date,
    page: number,
): ReadingsPage {
    const username = parseUsername(doc);
    const items = doc.querySelectorAll('ol.reading > li');
    const works = [];
    let index = 0;
    for (const item of Array.from(items)) {
        const work = parseReadingBlurb(item, now, `deleted-${page}-${index}`);
        index += 1;
        if (work) {
            works.push(work);
        }
    }
    return {
        username,
        loggedIn: username !== null,
        lastPage: parseLastPage(doc),
        works,
    };
}
