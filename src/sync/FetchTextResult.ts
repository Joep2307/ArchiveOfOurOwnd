/** What `FetchText` resolves to. */
export type FetchTextResult = {
    status: number;
    /** Final URL after redirects. */
    url: string;
    retryAfter: string | null;
    text: string;
};
