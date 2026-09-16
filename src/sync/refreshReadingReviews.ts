import type { Library, Work } from '@/model';
import { DATE_TOLERANCE_DAYS } from './constants';
import { daysBetween } from './daysBetween';

/** A later visit makes a previous "not read" answer uncertain again. */
export function refreshReadingReviews(
    base: Library,
    fresh: readonly Work[],
): NonNullable<Library['reviews']> {
    if (!base.reviews) return {};
    const stored = new Map(base.works.map((work) => [work.key, work]));
    const revisited = new Set(
        fresh
            .filter((work) => {
                const previous = stored.get(work.key);
                if (!previous || work.kind !== 'work') return false;
                const newerDate =
                    work.lastVisited !== null &&
                    previous.lastVisited !== null &&
                    work.lastVisited > previous.lastVisited &&
                    daysBetween(work.lastVisited, previous.lastVisited) >
                        DATE_TOLERANCE_DAYS;
                return work.visits > previous.visits || newerDate;
            })
            .map((work) => work.key),
    );
    return Object.fromEntries(
        Object.entries(base.reviews).filter(
            ([key, review]) =>
                review.status !== 'opened' || !revisited.has(key),
        ),
    );
}
