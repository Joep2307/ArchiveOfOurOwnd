/** Name of the logged-in user from the AO3 header, or `null`. */
export function parseUsername(doc: Document): string | null {
    const link = doc.querySelector('#greeting a[href^="/users/"]');
    const match = /^\/users\/([^/?#]+)/.exec(link?.getAttribute('href') ?? '');
    return match ? decodeURIComponent(match[1] ?? '') : null;
}
