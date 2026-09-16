import type { Work, WorkFeedback } from '@/model';

/**
 * Works a scan still has to look at: never checked, not readable last
 * time, or opened again since without both kudos and a comment.
 */
export function feedbackCandidates(
    works: readonly Work[],
    feedback: Readonly<Record<string, WorkFeedback>>,
): Work[] {
    return works.filter((work) => {
        if (work.kind !== 'work' || work.id === null) {
            return false;
        }
        const previous = feedback[work.key];
        if (!previous) {
            return true;
        }
        if (previous.kudos === true && previous.commented === true) {
            return false;
        }
        if (previous.kudos === null || previous.commented === null) {
            return true;
        }
        // Visit dates are whole days, so a same-day visit counts.
        return (
            work.lastVisited !== null &&
            work.lastVisited >= previous.checkedAt.slice(0, 10)
        );
    });
}
