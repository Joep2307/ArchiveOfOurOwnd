import '@/styles/content.scss';
import { OPEN_DASHBOARD_MESSAGE } from '@/background';
import { getBrowserApi } from '@/browser';
import { startContentScript } from '@/content';
import { startDashboardBridge } from '@/connection/contentBridge';
import { trackReadingActivity } from '@/content/trackReadingActivity';
import { ACTIVITY_MESSAGE } from '@/content/readingActivity';
import { messageRecord } from '@/connection/protocol';

const api = getBrowserApi();
if (api && location.origin !== 'https://archiveofourown.org') {
    startDashboardBridge(api);
} else if (api) {
    trackReadingActivity(document, async (update) => {
        const result: unknown = await api.runtime.sendMessage({
            type: ACTIVITY_MESSAGE,
            ...update,
        });
        if (messageRecord(result).saved !== true) {
            throw new Error('Reading time has not been saved yet.');
        }
    });
    void startContentScript(document, {
        storage: api.storage.local,
        pathname: location.pathname,
        openDashboard: () => {
            void api.runtime.sendMessage({ type: OPEN_DASHBOARD_MESSAGE });
        },
        onStorageChange: (listener) => {
            api.storage.onChanged.addListener((_changes, area) => {
                if (area === 'local') {
                    listener();
                }
            });
        },
    });
}
