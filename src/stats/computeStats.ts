import type { ReadingReview, Work } from '@/model';
import { RATINGS } from '@/model';
import { buildTimeline } from './buildTimeline';
import {
    WORD_BUCKET_EDGES,
    WORD_BUCKET_LABELS,
    WORDS_PER_MINUTE,
    WORDS_PER_NOVEL,
} from './constants';
import type { CountEntry } from './CountEntry';
import { countFacet } from './countFacet';
import type { Stats } from './Stats';
import type { StatsCore } from './StatsCore';
import { topWorks } from './topWorks';

function dateRange(works: readonly Work[]): [string | null, string | null] {
    const dates = works
        .map((work) => work.lastVisited)
        .filter((date): date is string => date !== null)
        .sort();
    return [dates[0] ?? null, dates.at(-1) ?? null];
}

function wordBuckets(
    readable: readonly Work[],
    core: StatsCore,
    wordsRead: (work: Work) => number,
): CountEntry[] {
    const counts = core.histogram(
        readable.map((work) => work.words),
        WORD_BUCKET_EDGES,
    );
    const words = WORD_BUCKET_LABELS.map(() => 0);
    const visits = WORD_BUCKET_LABELS.map(() => 0);
    for (const work of readable) {
        const index = WORD_BUCKET_EDGES.findLastIndex(
            (edge) => work.words >= edge,
        );
        words[index] = (words[index] ?? 0) + wordsRead(work);
        visits[index] = (visits[index] ?? 0) + work.visits;
    }
    return WORD_BUCKET_LABELS.map((label, index) => ({
        value: label,
        label,
        field: 'wordBucket',
        works: counts[index] ?? 0,
        words: words[index] ?? 0,
        visits: visits[index] ?? 0,
    }));
}

function sortByValue(entries: CountEntry[]): CountEntry[] {
    return entries.sort((a, b) => a.value.localeCompare(b.value));
}

/** Computes every statistic for a list of works. */
export function computeStats(
    imported: readonly Work[],
    core: StatsCore,
    reviews: Record<string, ReadingReview> = {},
    wordsPerMinute: number = WORDS_PER_MINUTE,
): Stats {
    // Preserve raw AO3 records; apply review snapshots only to statistics.
    const works = imported
        .filter((work) => reviews[work.key]?.status !== 'opened')
        .map((work) => {
            const review = reviews[work.key];
            return review?.status === 'finished' ||
                (review?.source === 'activity' && review.status === 'partial')
                ? { ...work, words: review.words }
                : work;
        });
    const wordsRead = (work: Work): number => {
        const review = reviews[work.key];
        return (
            work.words *
            (review?.status === 'finished' ? (review.readCount ?? 1) : 1)
        );
    };
    const isReread = (work: Work): boolean => {
        const review = reviews[work.key];
        return review?.status === 'finished' && (review.readCount ?? 1) > 1;
    };
    const effectiveVisits = (work: Work): number => {
        const review = reviews[work.key];
        return review?.status === 'finished'
            ? (review.readCount ?? 1)
            : work.visits;
    };
    const readable = works.filter((work) => work.kind === 'work');
    const timeline = buildTimeline(works);
    const [firstVisited, lastVisited] = dateRange(works);

    const authors = countFacet(readable, 'author', { wordsRead });
    const fandoms = countFacet(readable, 'fandom', { wordsRead });
    const relationships = countFacet(readable, 'relationship', { wordsRead });
    const characters = countFacet(readable, 'character', { wordsRead });
    const freeforms = countFacet(readable, 'freeform', { wordsRead });
    const series = countFacet(readable, 'series', { wordsRead });
    const languages = countFacet(readable, 'language', { wordsRead });

    const words = readable.reduce((sum, work) => sum + wordsRead(work), 0);
    const confirmedWords = readable.reduce(
        (sum, work) =>
            sum +
            (reviews[work.key]?.status === 'finished' &&
            reviews[work.key]?.source !== 'activity'
                ? wordsRead(work)
                : 0),
        0,
    );
    const complete = readable.filter((work) => work.complete).length;

    const busiestMonth = timeline.reduce<Stats['busiestMonth']>(
        (best, point) =>
            best === null || point.works > best.works ? point : best,
        null,
    );

    return {
        totals: {
            entries: works.length,
            works: readable.length,
            deleted: works.filter((w) => w.kind === 'deleted').length,
            mystery: works.filter((w) => w.kind === 'mystery').length,
            words,
            confirmedWords,
            estimatedWords: words - confirmedWords,
            visits: imported.reduce(
                (sum, work) => sum + effectiveVisits(work),
                0,
            ),
            authors: authors.filter((a) => a.value !== 'Anonymous').length,
            fandoms: fandoms.length,
            relationships: relationships.length,
            characters: characters.length,
            tags: freeforms.length,
            series: series.length,
            languages: languages.length,
            rereads: readable.filter(isReread).length,
            complete,
            inProgress: readable.length - complete,
            updatesAvailable: readable.filter((w) => w.updateAvailable).length,
            markedForLater: works.filter((w) => w.markedForLater).length,
            chapters: readable.reduce(
                (sum, work) => sum + work.chaptersPosted,
                0,
            ),
            readingMinutes: Math.round(words / wordsPerMinute),
            novels: words / WORDS_PER_NOVEL,
            firstVisited,
            lastVisited,
        },
        wordSummary: core.summarize(readable.map((work) => work.words)),
        visitSummary: core.summarize(imported.map(effectiveVisits)),
        kudosSummary: core.summarize(readable.map((work) => work.kudos)),
        chapterSummary: core.summarize(
            readable.map((work) => work.chaptersPosted),
        ),
        timeline,
        visitedYears: sortByValue(countFacet(works, 'visitedYear')),
        updatedYears: sortByValue(
            countFacet(readable, 'updatedYear', { wordsRead }),
        ),
        ratings: countFacet(readable, 'rating', { order: RATINGS, wordsRead }),
        categories: countFacet(readable, 'category', { wordsRead }),
        warnings: countFacet(readable, 'warning', { wordsRead }),
        wordBuckets: wordBuckets(readable, core, wordsRead),
        status: countFacet(readable, 'status', {
            order: ['Complete', 'In progress'],
            keepEmpty: true,
            wordsRead,
        }),
        languages,
        authors,
        fandoms,
        relationships,
        characters,
        freeforms,
        series,
        mostVisited: topWorks(readable, effectiveVisits, readable.length),
        longest: topWorks(readable, (w) => w.words, readable.length),
        shortest: topWorks(readable, (w) => -w.words, readable.length),
        mostKudos: topWorks(readable, (w) => w.kudos, readable.length),
        hiddenGems: topWorks(
            readable.filter(isReread),
            (w) => -w.kudos,
            readable.length,
        ),
        busiestMonth,
    };
}
