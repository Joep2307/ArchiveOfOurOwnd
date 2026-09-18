import { hideRemoved, type Library, type Work } from '@/model';
import type { ReadIndex } from './ReadIndex';

export function buildReadIndex(
    library: Library | null,
    openedIds: readonly number[],
): ReadIndex {
    const index = new Map<number, Work | null>();
    for (const id of openedIds) {
        index.set(id, null);
    }
    const works = library ? hideRemoved(library).works : [];
    for (const work of works) {
        if (work.id !== null) {
            const review = library?.reviews?.[work.key];
            if (
                review?.status === 'opened' ||
                (review?.source === 'activity' && review.status !== 'finished')
            ) {
                index.delete(work.id);
                continue;
            }
            index.set(work.id, work);
        }
    }
    return index;
}
