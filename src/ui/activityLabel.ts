import type { ReadingReview } from '@/model';

export function activityLabel(review: ReadingReview | undefined): string {
    if (review?.source !== 'activity') return '';
    const status =
        review.status === 'finished'
            ? 'Likely finished'
            : review.status === 'opened'
              ? 'Just opened'
              : 'Partly read';
    const minutes = Math.round((review.activeMs ?? 0) / 60000);
    return `${status} · ${minutes} min active`;
}
