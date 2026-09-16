/**
 * The WebExtension API. Chrome exposes it as `chrome`, Firefox as
 * `browser` (and `chrome`); in MV3 both return promises.
 */
export type BrowserApi = typeof chrome;
