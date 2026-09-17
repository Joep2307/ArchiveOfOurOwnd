/** Add the exact HTTPS production origin here before publishing the site. */
export const DASHBOARD_ORIGINS = [
    'http://127.0.0.1:5173',
    'http://localhost:5173',
];
export const BRIDGE = 'reading-stats-connection-v1';

export function messageRecord(value: unknown): Record<string, unknown> {
    return typeof value === 'object' && value !== null
        ? (value as Record<string, unknown>)
        : {};
}

export function isDashboardUrl(value: string): boolean {
    try {
        return DASHBOARD_ORIGINS.includes(new URL(value).origin);
    } catch {
        return false;
    }
}

/** Only read-only pages used by history sync and feedback checking. */
export function isAllowedAo3Url(value: string): boolean {
    try {
        const url = new URL(value);
        return (
            url.origin === 'https://archiveofourown.org' &&
            !url.username &&
            !url.password &&
            (url.pathname === '/' ||
                /^\/users\/[^/]+\/readings\/?$/.test(url.pathname) ||
                /^\/works\/\d+(?:\/kudos|\/comments)?\/?$/.test(
                    url.pathname,
                ) ||
                /^\/comments\/(?:\d+|show_comments)$/.test(url.pathname)) &&
            [...url.searchParams.keys()].every((key) =>
                [
                    'page',
                    'view_adult',
                    'show_comments',
                    'view_full_work',
                    'work_id',
                ].includes(key),
            )
        );
    } catch {
        return false;
    }
}
