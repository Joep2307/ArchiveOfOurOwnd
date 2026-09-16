import type { AuthorRef } from '@/model';

const PSEUD_HREF = /\/users\/([^/]+)\/pseuds\/([^/?#]+)/;

/** Reads the creators from the heading of a blurb. */
export function parseAuthors(heading: Element): AuthorRef[] {
    const links = heading.querySelectorAll('a[rel="author"]');
    const authors: AuthorRef[] = [];
    for (const link of Array.from(links)) {
        const match = PSEUD_HREF.exec(link.getAttribute('href') ?? '');
        if (!match) {
            continue;
        }
        authors.push({
            user: decodeURIComponent(match[1] ?? ''),
            pseud: decodeURIComponent(match[2] ?? ''),
        });
    }
    return authors;
}
