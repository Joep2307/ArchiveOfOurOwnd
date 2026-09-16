import { formatCompact } from './formatCompact';
import { formatDate } from './formatDate';
import { formatDuration } from './formatDuration';
import { formatNumber } from './formatNumber';
import { plural } from './plural';

describe('format', () => {
    it('formats numbers', () => {
        expect(formatNumber(12345.6)).toBe('12,346');
        expect(formatCompact(12345)).toBe('12.3K');
        expect(plural(1, 'work')).toBe('1 work');
        expect(plural(1200, 'work')).toBe('1,200 works');
    });

    it('formats dates and durations', () => {
        expect(formatDate('2024-03-05')).toBe('Mar 5, 2024');
        expect(formatDate(null)).toBe('—');
        expect(formatDuration(45)).toBe('45 min');
        expect(formatDuration(125)).toBe('2 h 5 min');
        expect(formatDuration(60 * 24 * 3 + 240)).toBe('3 days 4 h');
    });
});
