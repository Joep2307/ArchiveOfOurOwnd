import { parseAo3Date } from './parseAo3Date';

const NOW = new Date(2026, 8, 16, 12, 0, 0);

describe('parseAo3Date', () => {
    it.each([
        ['05 Mar 2024', '2024-03-05'],
        ['1 Dec 2010', '2010-12-01'],
        ['less than a minute', '2026-09-16'],
        ['about 5 hours', '2026-09-16'],
        ['1 day', '2026-09-15'],
        ['29 days', '2026-08-18'],
        ['about 1 month', '2026-08-17'],
    ])('parses %s', (text, expected) => {
        expect(parseAo3Date(text, NOW)).toBe(expected);
    });

    it('returns null for junk', () => {
        expect(parseAo3Date('whenever', NOW)).toBeNull();
    });
});
