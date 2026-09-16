import type { Work } from '@/model';
import { MAX_SUMMARY_LENGTH } from './constants';
import { parseAuthors } from './parseAuthors';
import { parseChapters } from './parseChapters';
import { parseCount } from './parseCount';
import { parseAo3Date } from './parseAo3Date';
import { parseRating } from './parseRating';
import { parseSeries } from './parseSeries';
import { parseVisitInfo } from './parseVisitInfo';
import { tagsIn } from './tagsIn';
import { textOf } from './textOf';

function emptyWork(key: string): Work {
    return {
        key,
        kind: 'work',
        id: null,
        title: '',
        authors: [],
        anonymous: false,
        fandoms: [],
        rating: 'Not Rated',
        categories: [],
        warnings: [],
        relationships: [],
        characters: [],
        freeforms: [],
        language: '',
        words: 0,
        chaptersPosted: 0,
        chaptersTotal: null,
        complete: false,
        kudos: 0,
        comments: 0,
        bookmarks: 0,
        hits: 0,
        series: [],
        summary: '',
        updated: null,
        lastVisited: null,
        visits: 0,
        updateAvailable: false,
        markedForLater: false,
    };
}

function stat(item: Element, name: string): string {
    return textOf(item.querySelector(`dl.stats dd.${name}`));
}

function parseCategories(item: Element): string[] {
    const span = item.querySelector('.required-tags span.category');
    const title = span?.getAttribute('title') ?? textOf(span);
    if (!title || /^no category$/i.test(title)) {
        return [];
    }
    return title
        .split(/,\s*|\s+and\s+/)
        .map((part) => part.trim())
        .filter((part) => part.length > 0);
}

function truncate(text: string): string {
    return text.length > MAX_SUMMARY_LENGTH
        ? `${text.slice(0, MAX_SUMMARY_LENGTH - 1)}…`
        : text;
}

/**
 * Turns one `<li>` of the history list into a `Work`.
 *
 * `fallbackKey` is used for entries without a work id (deleted
 * works). Returns `null` when the element is not a history entry.
 */
export function parseReadingBlurb(
    item: Element,
    now: Date,
    fallbackKey: string,
): Work | null {
    if (!item.querySelector('h4.viewed')) {
        return null;
    }
    const visit = parseVisitInfo(item, now);
    const idMatch = /^work_(\d+)$/.exec(item.id);
    const id = idMatch ? Number(idMatch[1]) : null;

    const work = emptyWork(id === null ? fallbackKey : `work-${id}`);
    work.id = id;
    work.lastVisited = visit.lastVisited;
    work.visits = visit.visits;
    work.updateAvailable = visit.updateAvailable;
    work.markedForLater = visit.markedForLater;

    if (visit.deleted || id === null) {
        work.kind = 'deleted';
        work.title = 'Deleted work';
        return work;
    }

    if (item.querySelector('.mystery')) {
        work.kind = 'mystery';
        work.title = 'Mystery work';
        return work;
    }

    const header = item.querySelector('.header');
    const heading = header?.querySelector('h4.heading');
    const titleLink = heading?.querySelector('a[href*="/works/"]');
    work.title = textOf(titleLink) || 'Untitled';
    work.anonymous = header?.classList.contains('anonymous') ?? false;
    work.authors = heading ? parseAuthors(heading) : [];
    work.fandoms = tagsIn(item, 'h5.fandoms');
    work.rating = parseRating(item);
    work.categories = parseCategories(item);
    work.complete =
        item.querySelector('.required-tags .complete-yes') !== null;
    work.updated = parseAo3Date(
        textOf(header?.querySelector('p.datetime')),
        now,
    );

    work.warnings = tagsIn(item, 'ul.tags li.warnings');
    work.relationships = tagsIn(item, 'ul.tags li.relationships');
    work.characters = tagsIn(item, 'ul.tags li.characters');
    work.freeforms = tagsIn(item, 'ul.tags li.freeforms');

    work.summary = truncate(textOf(item.querySelector('blockquote.summary')));
    work.series = parseSeries(item);

    work.language = stat(item, 'language');
    work.words = parseCount(stat(item, 'words'));
    const chapters = parseChapters(stat(item, 'chapters'));
    work.chaptersPosted = chapters.posted;
    work.chaptersTotal = chapters.total;
    work.kudos = parseCount(stat(item, 'kudos'));
    work.comments = parseCount(stat(item, 'comments'));
    work.bookmarks = parseCount(stat(item, 'bookmarks'));
    work.hits = parseCount(stat(item, 'hits'));

    return work;
}
