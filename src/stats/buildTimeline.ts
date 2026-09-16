import type { Work } from '@/model';
import { MONTH_LABELS } from './constants';
import type { TimelinePoint } from './TimelinePoint';

function monthLabel(month: string): string {
    const index = Number(month.slice(5, 7)) - 1;
    return `${MONTH_LABELS[index] ?? ''} ${month.slice(0, 4)}`;
}

function nextMonth(month: string): string {
    const year = Number(month.slice(0, 4));
    const index = Number(month.slice(5, 7));
    return index === 12
        ? `${year + 1}-01`
        : `${year}-${String(index + 1).padStart(2, '0')}`;
}

/**
 * Monthly counts from the first to the last visited month, with
 * empty months filled in.
 */
export function buildTimeline(works: readonly Work[]): TimelinePoint[] {
    const counts = new Map<string, TimelinePoint>();
    for (const work of works) {
        if (!work.lastVisited) {
            continue;
        }
        const month = work.lastVisited.slice(0, 7);
        const point = counts.get(month) ?? {
            month,
            label: monthLabel(month),
            works: 0,
            words: 0,
        };
        point.works += 1;
        point.words += work.words;
        counts.set(month, point);
    }
    const months = [...counts.keys()].sort();
    const first = months[0];
    const last = months.at(-1);
    if (!first || !last) {
        return [];
    }
    const timeline: TimelinePoint[] = [];
    for (let month = first; month <= last; month = nextMonth(month)) {
        timeline.push(
            counts.get(month) ?? {
                month,
                label: monthLabel(month),
                works: 0,
                words: 0,
            },
        );
    }
    return timeline;
}
