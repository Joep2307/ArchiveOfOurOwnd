import type { BrowserApi } from '@/browser';
import { isOpenDashboardMessage } from './isOpenDashboardMessage';
import { openDashboard } from './openDashboard';

/** Wires the toolbar button, AO3 link and the first-install page. */
export function startBackground(api: BrowserApi): void {
    api.action.onClicked.addListener(() => {
        void openDashboard(api);
    });
    api.runtime.onMessage.addListener((message) => {
        if (isOpenDashboardMessage(message)) {
            void openDashboard(api);
        }
    });
    api.runtime.onInstalled.addListener((details) => {
        if (details.reason === 'install') {
            void openDashboard(api);
        }
    });
}
