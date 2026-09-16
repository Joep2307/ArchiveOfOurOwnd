import { createDemoLibrary } from '@/demo';
import { loadCore } from '../../tests/loadCore';
import { computeStats } from './computeStats';
import { emptyFilter } from './emptyFilter';
import { filterWorks } from './filterWorks';

const core = loadCore();
const library = createDemoLibrary(300);
const today = new Date(2026, 8, 16);

describe('computeStats', () => {
    const stats = computeStats(library.works, core);

    it('adds up totals', () => {
        const readable = library.works.filter((w) => w.kind === 'work');
        expect(stats.totals.entries).toBe(300);
        expect(stats.totals.works).toBe(readable.length);
        expect(stats.totals.words).toBe(
            readable.reduce((sum, w) => sum + w.words, 0),
        );
        expect(stats.wordSummary.count).toBe(readable.length);
        expect(stats.wordSummary.sum).toBe(stats.totals.words);
        expect(stats.totals.complete + stats.totals.inProgress).toBe(
            readable.length,
        );
    });

    it('buckets every readable work once', () => {
        const total = stats.wordBuckets.reduce((s, b) => s + b.works, 0);
        expect(total).toBe(stats.totals.works);
        const words = stats.wordBuckets.reduce((s, b) => s + b.words, 0);
        expect(words).toBe(stats.totals.words);
    });

    it('keeps the timeline continuous', () => {
        const months = stats.timeline.map((p) => p.month);
        expect(months).toEqual([...months].sort());
        const sum = stats.timeline.reduce((s, p) => s + p.works, 0);
        expect(sum).toBe(library.works.filter((w) => w.lastVisited).length);
    });

    it('sorts top lists by count', () => {
        const counts = stats.fandoms.map((f) => f.works);
        expect(counts).toEqual([...counts].sort((a, b) => b - a));
        expect(stats.longest[0]?.words).toBe(stats.wordSummary.max);
    });
});

describe('filterWorks', () => {
    it('combines facets, period and search', () => {
        const fandom =
            library.works.find((w) => w.kind === 'work')?.fandoms[0] ?? '';
        const filter = {
            ...emptyFilter(),
            facets: [{ field: 'fandom' as const, value: fandom }],
        };
        const result = filterWorks(library.works, filter, today);
        expect(result.length).toBeGreaterThan(0);
        expect(result.every((w) => w.fandoms.includes(fandom))).toBe(true);

        const recent = filterWorks(
            library.works,
            { ...emptyFilter(), period: 'last30' },
            today,
        );
        expect(
            recent.every((w) => (w.lastVisited ?? '') >= '2026-08-17'),
        ).toBe(true);

        const none = filterWorks(
            library.works,
            { ...emptyFilter(), query: 'zzzz-no-match' },
            today,
        );
        expect(none).toHaveLength(0);
    });
});
