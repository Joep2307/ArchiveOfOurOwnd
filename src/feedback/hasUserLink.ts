/**
 * Whether any link matching `selector` points to `username`'s profile
 * or one of their pseuds. AO3 logins ignore case.
 */
export function hasUserLink(
    root: ParentNode,
    selector: string,
    username: string,
): boolean {
    const login = username.toLowerCase();
    for (const link of Array.from(root.querySelectorAll(selector))) {
        const href = link.getAttribute('href') ?? '';
        const match = /^\/users\/([^/?#]+)/.exec(href);
        if (!match?.[1]) {
            continue;
        }
        let name: string;
        try {
            name = decodeURIComponent(match[1]);
        } catch {
            continue;
        }
        if (name.toLowerCase() === login) {
            return true;
        }
    }
    return false;
}
