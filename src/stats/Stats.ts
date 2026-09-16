import type { Work } from '@/model';
import type { CountEntry } from './CountEntry';
import type { NumberSummary } from './NumberSummary';
import type { TimelinePoint } from './TimelinePoint';
import type { Totals } from './Totals';

/** Everything the dashboard shows, for one set of works. */
export type Stats = {
    totals: Totals;
    wordSummary: NumberSummary;
    visitSummary: NumberSummary;
    kudosSummary: NumberSummary;
    chapterSummary: NumberSummary;
    timeline: TimelinePoint[];
    visitedYears: CountEntry[];
    updatedYears: CountEntry[];
    ratings: CountEntry[];
    categories: CountEntry[];
    warnings: CountEntry[];
    wordBuckets: CountEntry[];
    status: CountEntry[];
    languages: CountEntry[];
    authors: CountEntry[];
    fandoms: CountEntry[];
    relationships: CountEntry[];
    characters: CountEntry[];
    freeforms: CountEntry[];
    series: CountEntry[];
    mostVisited: Work[];
    longest: Work[];
    mostKudos: Work[];
    hiddenGems: Work[];
    busiestMonth: TimelinePoint | null;
};
