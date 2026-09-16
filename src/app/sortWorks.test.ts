import { createDemoLibrary } from '@/demo';
import { sortWorks } from './sortWorks';

describe('sortWorks', () => {
    const { works } = createDemoLibrary(200);
    const lengths = (sorted: typeof works): number[] =>
        sorted.filter((w) => w.kind === 'work').map((w) => w.words);

    it('puts the longest works first', () => {
        const sorted = lengths(sortWorks(works, 'words', true));
        expect(sorted).toEqual([...sorted].sort((a, b) => b - a));
    });

    it('puts the shortest works first', () => {
        const sorted = lengths(sortWorks(works, 'words', false));
        expect(sorted).toEqual([...sorted].sort((a, b) => a - b));
    });

    it('keeps entries without a length at the end', () => {
        expect(works.some((w) => w.kind !== 'work')).toBe(true);
        for (const descending of [true, false]) {
            const kinds = sortWorks(works, 'words', descending).map(
                (w) => w.kind === 'work',
            );
            expect(kinds.indexOf(false)).toBe(kinds.lastIndexOf(true) + 1);
        }
    });
});
