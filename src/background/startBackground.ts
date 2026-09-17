import type { BrowserApi } from '@/browser';
import { isOpenDashboardMessage } from './isOpenDashboardMessage';
import { openDashboard } from './openDashboard';
import {
    BRIDGE,
    isAllowedAo3Url,
    isDashboardUrl,
    messageRecord,
} from '@/connection/protocol';
import { browserFetchText } from '@/sync';

/** Wires the toolbar button, AO3 link and the first-install page. */
export function startBackground(api: BrowserApi): void {
    api.action.onClicked.addListener(() => {
        void openDashboard(api);
    });
    api.runtime.onMessage.addListener((value: unknown, sender, respond) => {
        const message = messageRecord(value);
        if (message.type === BRIDGE) {
            if (
                !sender.url ||
                !isDashboardUrl(sender.url) ||
                sender.frameId !== 0 ||
                typeof message.url !== 'string' ||
                !isAllowedAo3Url(message.url)
            ) {
                respond({ error: 'This request is not allowed.' });
                return false;
            }
            const headers =
                new URL(message.url).pathname === '/comments/show_comments'
                    ? {
                          Accept: 'text/javascript, application/javascript',
                          'X-Requested-With': 'XMLHttpRequest',
                      }
                    : undefined;
            void browserFetchText(
                message.url,
                AbortSignal.timeout(55000),
                headers,
            ).then(
                (result) => {
                    respond({ result });
                },
                () => {
                    respond({
                        error: 'Could not reach AO3. Please try again.',
                    });
                },
            );
            return true;
        }
        if (isOpenDashboardMessage(message)) {
            void openDashboard(api);
        }
        return false;
    });
    api.runtime.onInstalled.addListener((details) => {
        if (details.reason === 'install') {
            void openDashboard(api);
        }
    });
}
