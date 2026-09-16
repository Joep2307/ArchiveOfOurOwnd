export type FetchTextResult = {
    status: number;
    /** Final URL after redirects. */
    url: string;
    retryAfter: string | null;
    text: string;
};

/** Loads a URL with the user's AO3 cookies. */
export type FetchText = (
    url: string,
    signal?: AbortSignal,
) => Promise<FetchTextResult>;
