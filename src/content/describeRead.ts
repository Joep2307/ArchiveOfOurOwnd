import { formatDate, plural } from '@/format';
import type { Work } from '@/model';

/** Tooltip for a highlighted work. */
export function describeRead(work: Work | null): string {
    if (!work) {
        return 'Opened (not synced to Reading Stats yet)';
    }
    const parts = ['In your AO3 history'];
    if (work.lastVisited) {
        parts.push(`last opened ${formatDate(work.lastVisited)}`);
    }
    if (work.visits > 0) {
        parts.push(plural(work.visits, 'visit'));
    }
    return parts.join(' · ');
}
