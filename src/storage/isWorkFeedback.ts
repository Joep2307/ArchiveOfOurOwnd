import type { WorkFeedback } from '@/model';

const isAnswer = (value: unknown): boolean =>
    value === null || typeof value === 'boolean';

/** Loose shape check for a stored or imported feedback entry. */
export function isWorkFeedback(value: unknown): value is WorkFeedback {
    return (
        typeof value === 'object' &&
        value !== null &&
        'kudos' in value &&
        isAnswer(value.kudos) &&
        'commented' in value &&
        isAnswer(value.commented) &&
        'checkedAt' in value &&
        typeof value.checkedAt === 'string'
    );
}
