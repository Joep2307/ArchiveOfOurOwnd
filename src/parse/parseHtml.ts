/** Parses an HTML string into a detached document. */
export function parseHtml(html: string): Document {
    return new DOMParser().parseFromString(html, 'text/html');
}
