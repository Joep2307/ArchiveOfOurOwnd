import { parseLastPage } from '@/parse';
import type { FeedbackPage } from './FeedbackPage';
import { hasUserLink } from './hasUserLink';

/** Reads a `/works/<id>/kudos` page. */
export function parseKudosPage(doc: Document, username: string): FeedbackPage {
    return {
        found: hasUserLink(doc, '#kudos a[href^="/users/"]', username),
        lastPage: parseLastPage(doc),
        cutThreads: [],
    };
}
