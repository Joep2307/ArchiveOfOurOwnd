import type { Work } from '@/model';
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

const TOP_WORKS = 10;

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
        words[index] = (words[index] ?? 0) + work.words;
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
export function computeStats(works: readonly Work[], core: StatsCore): Stats {
    const readable = works.filter((work) => work.kind === 'work');
    const timeline = buildTimeline(works);
    const [firstVisited, lastVisited] = dateRange(works);

    const authors = countFacet(readable, 'author');
    const fandoms = countFacet(readable, 'fandom');
    const relationships = countFacet(readable, 'relationship');
    const characters = countFacet(readable, 'character');
    const freeforms = countFacet(readable, 'freeform');
    const series = countFacet(readable, 'series');
    const languages = countFacet(readable, 'language');

    const words = readable.reduce((sum, work) => sum + work.words, 0);
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
            visits: works.reduce((sum, work) => sum + work.visits, 0),
            authors: authors.filter((a) => a.value !== 'Anonymous').length,
            fandoms: fandoms.length,
            relationships: relationships.length,
            characters: characters.length,
            tags: freeforms.length,
            series: series.length,
            languages: languages.length,
            rereads: works.filter((work) => work.visits > 1).length,
            complete,
            inProgress: readable.length - complete,
            updatesAvailable: readable.filter((w) => w.updateAvailable).length,
            markedForLater: works.filter((w) => w.markedForLater).length,
            chapters: readable.reduce(
                (sum, work) => sum + work.chaptersPosted,
                0,
            ),
            readingMinutes: Math.round(words / WORDS_PER_MINUTE),
            novels: words / WORDS_PER_NOVEL,
            firstVisited,
            lastVisited,
        },
        wordSummary: core.summarize(readable.map((work) => work.words)),
        visitSummary: core.summarize(works.map((work) => work.visits)),
        kudosSummary: core.summarize(readable.map((work) => work.kudos)),
        chapterSummary: core.summarize(
            readable.map((work) => work.chaptersPosted),
        ),
        timeline,
        visitedYears: sortByValue(countFacet(works, 'visitedYear')),
        updatedYears: sortByValue(countFacet(readable, 'updatedYear')),
        ratings: countFacet(readable, 'rating', { order: RATINGS }),
        categories: countFacet(readable, 'category'),
        warnings: countFacet(readable, 'warning'),
        wordBuckets: wordBuckets(readable, core),
        status: countFacet(readable, 'status', {
            order: ['Complete', 'In progress'],
            keepEmpty: true,
        }),
        languages,
        authors,
        fandoms,
        relationships,
        characters,
        freeforms,
        series,
        mostVisited: topWorks(readable, (w) => w.visits, TOP_WORKS),
        longest: topWorks(readable, (w) => w.words, TOP_WORKS),
        shortest: topWorks(readable, (w) => -w.words, TOP_WORKS),
        mostKudos: topWorks(readable, (w) => w.kudos, TOP_WORKS),
        hiddenGems: topWorks(
            readable.filter((w) => w.visits > 1),
            (w) => -w.kudos,
            TOP_WORKS,
        ),
        busiestMonth,
    };
}
