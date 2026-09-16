import type { Library } from '@/model';
import { isWorkFeedback } from './isWorkFeedback';

/** Loose shape check for data read from storage or a file. */
export function isLibrary(value: unknown): value is Library {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    const candidate = value as Record<string, unknown>;
    return (
        candidate.version === 1 &&
        typeof candidate.username === 'string' &&
        Array.isArray(candidate.works) &&
        (candidate.feedback === undefined ||
            (typeof candidate.feedback === 'object' &&
                candidate.feedback !== null &&
                !Array.isArray(candidate.feedback) &&
                Object.values(candidate.feedback).every(isWorkFeedback))) &&
        (candidate.reviews === undefined ||
            (typeof candidate.reviews === 'object' &&
                candidate.reviews !== null &&
                !Array.isArray(candidate.reviews) &&
                Object.values(candidate.reviews).every(
                    (review: unknown) =>
                        review !== null &&
                        typeof review === 'object' &&
                        'status' in review &&
                        typeof review.status === 'string' &&
                        'words' in review &&
                        typeof review.words === 'number' &&
                        'reviewedAt' in review &&
                        ['finished', 'partial', 'opened', 'unsure'].includes(
                            review.status,
                        ) &&
                        Number.isFinite(review.words) &&
                        review.words >= 0 &&
                        typeof review.reviewedAt === 'string' &&
                        (!('readCount' in review) ||
                            (typeof review.readCount === 'number' &&
                                Number.isSafeInteger(review.readCount) &&
                                review.readCount >= 1)),
                )))
    );
}
