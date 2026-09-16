import { niceTicks } from './niceTicks';

describe('niceTicks', () => {
    it.each([
        [87, [0, 25, 50, 75, 100]],
        [4, [0, 1, 2, 3, 4]],
        [0, [0, 1]],
        [1200, [0, 500, 1000, 1500]],
    ])('ticks for %d', (max, expected) => {
        expect(niceTicks(max)).toEqual(expected);
    });
});
