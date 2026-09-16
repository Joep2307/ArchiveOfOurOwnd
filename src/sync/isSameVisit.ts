import type { Work } from '@/model';
import { DATE_TOLERANCE_DAYS } from './constants';
import { daysBetween } from './daysBetween';

/** `true` when a fresh entry matches what is already stored. */
export function isSameVisit(fresh: Work, stored: Work): boolean {
    if (fresh.visits !== stored.visits) {
        return false;
    }
    if (fresh.lastVisited === null || stored.lastVisited === null) {
        return fresh.lastVisited === stored.lastVisited;
    }
    return (
        daysBetween(fresh.lastVisited, stored.lastVisited) <=
        DATE_TOLERANCE_DAYS
    );
}
