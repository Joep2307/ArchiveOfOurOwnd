import type { BrowserApi } from '@/browser';
import { openDashboard } from './openDashboard';

/** Wires the toolbar button and the first-install page. */
export function startBackground(api: BrowserApi): void {
    api.action.onClicked.addListener(() => {
        void openDashboard(api);
    });
    api.runtime.onInstalled.addListener((details) => {
        if (details.reason === 'install') {
            void openDashboard(api);
        }
    });
}
