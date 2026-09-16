import type { BrowserApi } from '@/browser';
import { DASHBOARD_PAGE } from './constants';

/** Focuses an open dashboard tab, or opens a new one. */
export async function openDashboard(api: BrowserApi): Promise<void> {
    const url = api.runtime.getURL(DASHBOARD_PAGE);
    try {
        const [existing] = await api.tabs.query({ url: `${url}*` });
        if (existing?.id !== undefined) {
            await api.tabs.update(existing.id, { active: true });
            await api.windows.update(existing.windowId, {
                focused: true,
            });
            return;
        }
    } catch {
        // Querying may need permissions we do not ask for.
    }
    await api.tabs.create({ url });
}
