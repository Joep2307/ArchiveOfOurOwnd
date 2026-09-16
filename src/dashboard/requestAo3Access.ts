import { getBrowserApi } from '@/browser';
import { AO3_MATCH_PATTERN } from './constants';

/**
 * Asks for the AO3 host permission. Chrome grants it at install;
 * Firefox asks the first time. New permission prompts require a click;
 * existing access can be checked during automatic startup sync.
 */
export async function requestAo3Access(): Promise<boolean> {
    const api = getBrowserApi();
    if (!api) {
        return false;
    }
    try {
        if (await api.permissions.contains({ origins: [AO3_MATCH_PATTERN] })) {
            return true;
        }
        return await api.permissions.request({
            origins: [AO3_MATCH_PATTERN],
        });
    } catch {
        return api.permissions.contains({
            origins: [AO3_MATCH_PATTERN],
        });
    }
}
