import type { FetchTextResult } from './FetchTextResult';

/** Loads a URL with the user's AO3 cookies. */
export type FetchText = (
    url: string,
    signal?: AbortSignal,
    headers?: Readonly<Record<string, string>>,
) => Promise<FetchTextResult>;
