import '@/styles/content.scss';
import { OPEN_DASHBOARD_MESSAGE } from '@/background';
import { getBrowserApi } from '@/browser';
import { startContentScript } from '@/content';
import { startDashboardBridge } from '@/connection/contentBridge';

const api = getBrowserApi();
if (api && location.origin !== 'https://archiveofourown.org') {
    startDashboardBridge(api);
} else if (api) {
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
