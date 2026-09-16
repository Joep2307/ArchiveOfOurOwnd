import { getBrowserApi } from '@/browser';
import { AO3_MATCH_PATTERN } from './constants';

/**
 * Asks for the AO3 host permission. Chrome grants it at install;
 * Firefox asks the first time. Must run inside a click handler.
 */
export async function requestAo3Access(): Promise<boolean> {
    const api = getBrowserApi();
    if (!api) {
        return false;
    }
    try {
        return await api.permissions.request({
            origins: [AO3_MATCH_PATTERN],
        });
    } catch {
        return api.permissions.contains({
            origins: [AO3_MATCH_PATTERN],
        });
    }
}
