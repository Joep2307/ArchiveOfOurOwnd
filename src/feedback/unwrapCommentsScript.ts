const PLACEHOLDER_CALL = new RegExp(
    String.raw`\$j\(\s*["']#comments_placeholder["']\s*\)` +
        String.raw`\s*\.\s*(?:html|append)` +
        String.raw`\(\s*"((?:[^"\\]|\\.)*)"\s*\)`,
    'gs',
);

const ESCAPES: Readonly<Record<string, string>> = {
    n: '\n',
    r: '\r',
    t: '\t',
};

/**
 * The HTML that AO3's `show_comments` script writes into the page,
 * joined in order. Empty when the answer is not that script.
 */
export function unwrapCommentsScript(script: string): string {
    const parts: string[] = [];
    for (const match of script.matchAll(PLACEHOLDER_CALL)) {
        parts.push(
            (match[1] ?? '').replace(
                /\\(.)/gs,
                (_, char: string) => ESCAPES[char] ?? char,
            ),
        );
    }
    return parts.join('');
}
