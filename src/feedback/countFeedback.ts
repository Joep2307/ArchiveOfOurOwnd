import type { Work, WorkFeedback } from '@/model';
import type { FeedbackTotals } from './FeedbackTotals';

/** Counts the reader's kudos and comments among `works`. */
export function countFeedback(
    works: readonly Work[],
    feedback: Readonly<Record<string, WorkFeedback>>,
): FeedbackTotals {
    const totals: FeedbackTotals = {
        checked: 0,
        kudos: 0,
        commented: 0,
        unchecked: 0,
    };
    for (const work of works) {
        if (work.kind !== 'work') {
            continue;
        }
        const result = feedback[work.key];
        if (!result) {
            totals.unchecked += 1;
            continue;
        }
        totals.checked += 1;
        totals.kudos += result.kudos ? 1 : 0;
        totals.commented += result.commented ? 1 : 0;
    }
    return totals;
}
