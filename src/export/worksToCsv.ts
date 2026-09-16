import type { Work } from '@/model';
import { csvCell } from './csvCell';

const COLUMNS: [string, (work: Work) => string | number | boolean][] = [
    ['id', (w) => w.id ?? ''],
    ['type', (w) => w.kind],
    ['title', (w) => w.title],
    ['authors', (w) => w.authors.map((a) => a.user).join('; ')],
    ['anonymous', (w) => w.anonymous],
    ['fandoms', (w) => w.fandoms.join('; ')],
    ['rating', (w) => w.rating],
    ['categories', (w) => w.categories.join('; ')],
    ['warnings', (w) => w.warnings.join('; ')],
    ['relationships', (w) => w.relationships.join('; ')],
    ['characters', (w) => w.characters.join('; ')],
    ['tags', (w) => w.freeforms.join('; ')],
    ['language', (w) => w.language],
    ['words', (w) => w.words],
    ['chapters_posted', (w) => w.chaptersPosted],
    ['chapters_total', (w) => w.chaptersTotal ?? '?'],
    ['complete', (w) => w.complete],
    ['kudos', (w) => w.kudos],
    ['comments', (w) => w.comments],
    ['bookmarks', (w) => w.bookmarks],
    ['hits', (w) => w.hits],
    ['series', (w) => w.series.map((s) => s.title).join('; ')],
    ['updated', (w) => w.updated ?? ''],
    ['last_visited', (w) => w.lastVisited ?? ''],
    ['visits', (w) => w.visits],
    ['update_available', (w) => w.updateAvailable],
    ['marked_for_later', (w) => w.markedForLater],
    [
        'url',
        (w) =>
            w.id === null ? '' : `https://archiveofourown.org/works/${w.id}`,
    ],
];

/** One CSV row per history entry, with a header row. */
export function worksToCsv(works: readonly Work[]): string {
    const header = COLUMNS.map(([name]) => name).join(',');
    const rows = works.map((work) =>
        COLUMNS.map(([, read]) => csvCell(read(work))).join(','),
    );
    return `${[header, ...rows].join('\r\n')}\r\n`;
}
