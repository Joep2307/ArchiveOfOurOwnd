import { createDemoLibrary } from '@/demo';
import { reviewCandidates } from './reviewCandidates';

describe('review candidates', () => {
    it('includes frequently visited works without duplicates', () => {
        const works = createDemoLibrary(30).works.map((work, i) => ({
            ...work,
            kind: 'work' as const,
            key: `work-${i}`,
            words: (30 - i) * 1000,
            visits: i < 5 || i >= 25 ? 100 : 1,
        }));
        const selected = reviewCandidates(works);
        expect(selected).toHaveLength(15);
        expect(new Set(selected.map((work) => work.key)).size).toBe(15);
        expect(selected.some((work) => work.key === 'work-29')).toBe(true);
        expect(selected.some((work) => work.key === 'work-15')).toBe(false);
    });

    it('excludes hidden works and avoids padding with one-visit works', () => {
        const works = createDemoLibrary(30).works.map((work, i) => ({
            ...work,
            kind: 'work' as const,
            key: `work-${i}`,
            visits: 1,
        }));
        expect(reviewCandidates(works)).toHaveLength(10);
        expect(
            reviewCandidates(
                works.map((work) => ({
                    ...work,
                    kind: 'deleted',
                })),
            ),
        ).toHaveLength(0);
    });
});
