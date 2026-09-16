import '@/styles/content.scss';
import { OPEN_DASHBOARD_MESSAGE } from '@/background';
import { getBrowserApi } from '@/browser';
import { startContentScript } from '@/content';

const api = getBrowserApi();
if (api) {
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
