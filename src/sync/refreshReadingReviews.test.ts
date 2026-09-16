import { createDemoLibrary } from '@/demo';
import { refreshReadingReviews } from './refreshReadingReviews';

describe('refresh reading reviews', () => {
    const base = createDemoLibrary(1);
    const work = base.works[0];
    if (!work) throw new Error('Missing fixture work');
    const original = {
        ...work,
        kind: 'work' as const,
        visits: 4,
        lastVisited: '2026-09-10',
    };
    base.works = [original];
    base.reviews = {
        [work.key]: {
            status: 'opened',
            words: work.words,
            reviewedAt: '2026-09-11',
        },
    };

    it('clears not-read for a clearly later visit even without a count change', () => {
        expect(
            refreshReadingReviews(base, [
                { ...original, lastVisited: '2026-09-16' },
            ])[original.key],
        ).toBeUndefined();
    });

    it('ignores date drift, older visits, and author updates', () => {
        for (const fresh of [
            { ...original, lastVisited: '2026-09-11' },
            { ...original, lastVisited: '2026-09-01', visits: 3 },
            { ...original, words: original.words + 1000 },
        ]) {
            expect(refreshReadingReviews(base, [fresh])).toEqual(base.reviews);
        }
    });

    it('preserves confirmed reads when a work is opened again', () => {
        const reviewed = {
            ...base,
            reviews: {
                [original.key]: {
                    status: 'finished' as const,
                    words: 100,
                    readCount: 1,
                    reviewedAt: '2026-09-11',
                },
            },
        };
        expect(
            refreshReadingReviews(reviewed, [
                {
                    ...original,
                    visits: 5,
                    lastVisited: '2026-09-16',
                },
            ]),
        ).toEqual(reviewed.reviews);
    });
});
