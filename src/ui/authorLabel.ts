import type { Work } from '@/model';

/** Creators of a work as display text. */
export function authorLabel(work: Work): string {
    if (work.anonymous) {
        return 'Anonymous';
    }
    if (work.authors.length === 0) {
        return '—';
    }
    return work.authors
        .map((author) =>
            author.pseud && author.pseud !== author.user
                ? `${author.pseud} (${author.user})`
                : author.user,
        )
        .join(', ');
}
