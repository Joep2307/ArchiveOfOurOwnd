import { parseLastPage } from '@/parse';
import type { FeedbackPage } from './FeedbackPage';
import { hasUserLink } from './hasUserLink';

/**
 * Reads a page of comment threads: the unwrapped `show_comments`
 * script or a `/comments/<id>` thread page.
 */
export function parseCommentsPage(
    doc: Document,
    username: string,
): FeedbackPage {
    const cutThreads = Array.from(
        doc.querySelectorAll('li.comment > p > a[href^="/comments/"]'),
    )
        .map((link) => link.getAttribute('href') ?? '')
        .map((href) => Number(/^\/comments\/(\d+)/.exec(href)?.[1]))
        .filter((id) => Number.isSafeInteger(id) && id > 0);
    return {
        found: hasUserLink(
            doc,
            'li.comment h4.byline a[href^="/users/"]',
            username,
        ),
        lastPage: parseLastPage(doc),
        cutThreads: [...new Set(cutThreads)],
    };
}
