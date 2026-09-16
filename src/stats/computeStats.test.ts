import { createDemoLibrary } from '@/demo';
import { loadCore } from '../../tests/loadCore';
import { computeStats } from './computeStats';
import { emptyFilter } from './emptyFilter';
import { filterWorks } from './filterWorks';
import type { ReadingReview } from '@/model/Library';

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
        expect(stats.shortest[0]?.words).toBe(stats.wordSummary.min);
    });

    it('applies reviews without rewriting AO3 history', () => {
        const template = library.works.find((w) => w.kind === 'work');
        if (!template) throw new Error('Missing fixture work');
        const works = ['once', 'multiple', 'unread', 'unknown'].map((key) => ({
            ...template,
            key,
            words: 200,
            visits: 30,
        }));
        const reviews: Record<string, ReadingReview> = {
            once: {
                status: 'finished',
                words: 100,
                readCount: 1,
                reviewedAt: '2026-09-16',
            },
            multiple: {
                status: 'finished',
                words: 100,
                readCount: 3,
                reviewedAt: '2026-09-16',
            },
            unread: { status: 'opened', words: 200, reviewedAt: '2026-09-16' },
        };
        const reviewed = computeStats(works, core, reviews);
        expect(reviewed.totals.works).toBe(3);
        expect(reviewed.totals.words).toBe(600);
        expect(reviewed.totals.confirmedWords).toBe(400);
        expect(reviewed.totals.estimatedWords).toBe(200);
        expect(reviewed.totals.rereads).toBe(1);
        expect(reviewed.totals.visits).toBe(120);
        expect(reviewed.totals.readingMinutes).toBe(2);
        expect(reviewed.wordSummary.max).toBe(200);
        expect(reviewed.wordBuckets.reduce((s, b) => s + b.words, 0)).toBe(
            600,
        );
        expect(reviewed.fandoms[0]?.words).toBe(600);
        expect(reviewed.hiddenGems.map((work) => work.key)).toEqual([
            'multiple',
        ]);
        expect(
            works.every((work) => work.words === 200 && work.visits === 30),
        ).toBe(true);
        const restored = computeStats(works, core);
        expect(restored.totals.works).toBe(4);
        expect(restored.totals.words).toBe(800);
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
