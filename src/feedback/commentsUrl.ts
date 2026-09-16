import { AO3_ORIGIN } from '@/parse';

/**
 * One page of comment threads on every chapter of a work, without the
 * work's text. AO3 answers with a script, see `unwrapCommentsScript`.
 */
export function commentsUrl(workId: number, page: number): string {
    return (
        `${AO3_ORIGIN}/comments/show_comments` +
        `?work_id=${workId}&page=${page}&view_adult=true`
    );
}
