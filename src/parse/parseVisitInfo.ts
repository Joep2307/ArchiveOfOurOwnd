import { parseAo3Date } from './parseAo3Date';
import { textOf } from './textOf';

export type VisitInfo = {
    lastVisited: string | null;
    visits: number;
    updateAvailable: boolean;
    markedForLater: boolean;
    deleted: boolean;
};

/** Reads the "Last visited … Visited N times" line of a blurb. */
export function parseVisitInfo(item: Element, now: Date): VisitInfo {
    const heading = item.querySelector('h4.viewed');
    const text = textOf(heading);
    const deleted = /deleted work/i.test(text);

    let dateText: string;
    if (deleted) {
        dateText = text.replace(/.*last visited/i, '');
    } else {
        const label = heading?.querySelector('span');
        const afterLabel = label?.nextSibling;
        dateText = afterLabel
            ? textOf(afterLabel)
            : text.replace(/^.*?last visited:?/i, '');
        dateText = dateText.split('(')[0] ?? '';
    }

    let visits = deleted ? 1 : 0;
    if (/visited once/i.test(text)) {
        visits = 1;
    } else {
        const match = /visited\s+([\d,]+)\s+times/i.exec(text);
        if (match) {
            visits = Number((match[1] ?? '0').replace(/,/g, ''));
        }
    }

    return {
        lastVisited: parseAo3Date(dateText, now),
        visits,
        updateAvailable: /update available/i.test(text),
        markedForLater: /marked for later/i.test(text),
        deleted,
    };
}
