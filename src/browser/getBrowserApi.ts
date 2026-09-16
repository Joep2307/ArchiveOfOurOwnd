import type { BrowserApi } from './BrowserApi';

type MaybeApis = {
    browser?: BrowserApi;
    chrome?: { runtime?: { id?: string } };
};

/**
 * Returns the extension API, or `null` when the page is not running
 * inside the extension (for example the local preview).
 */
export function getBrowserApi(): BrowserApi | null {
    const scope = globalThis as unknown as MaybeApis;
    const api = scope.browser ?? scope.chrome;
    // Outside an extension `chrome` may exist without a runtime id.
    return api?.runtime?.id ? (api as BrowserApi) : null;
}
