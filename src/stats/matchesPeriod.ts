import type { Work } from '@/model';
import { toIsoDate } from '@/parse';
import type { Period } from './Period';

function daysAgo(today: Date, days: number): string {
    const date = new Date(today);
    date.setDate(date.getDate() - days);
    return toIsoDate(date);
}

export function matchesPeriod(
    work: Work,
    period: Period,
    today: Date,
): boolean {
    if (period === 'all') {
        return true;
    }
    const visited = work.lastVisited;
    if (!visited) {
        return false;
    }
    if (period === 'last30') {
        return visited >= daysAgo(today, 30);
    }
    if (period === 'last365') {
        return visited >= daysAgo(today, 365);
    }
    return visited.startsWith(period.slice('year:'.length));
}
