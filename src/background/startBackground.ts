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
import { ACTIVITY_MESSAGE, saveActivity } from '@/content/readingActivity';
import { workIdFromHref } from '@/content/workIdFromHref';

/** Wires the toolbar button, AO3 link and the first-install page. */
export function startBackground(api: BrowserApi): void {
    let activityQueue = Promise.resolve();
    api.action.onClicked.addListener(() => {
        void openDashboard(api);
    });
    api.runtime.onMessage.addListener((value: unknown, sender, respond) => {
        const message = messageRecord(value);
        if (message.type === ACTIVITY_MESSAGE) {
            const {
                username,
                workId,
                chapter,
                session,
                activeMs,
                reachedEnd,
            } = message;
            if (
                !sender.url ||
                sender.frameId !== 0 ||
                workIdFromHref(sender.url) !== workId ||
                typeof username !== 'string' ||
                !username ||
                username.length > 256 ||
                typeof workId !== 'number' ||
                typeof chapter !== 'number' ||
                !Number.isSafeInteger(chapter) ||
                chapter < 1 ||
                chapter > 10000 ||
                typeof session !== 'string' ||
                session.length > 100 ||
                typeof activeMs !== 'number' ||
                !Number.isFinite(activeMs) ||
                activeMs < 0 ||
                typeof reachedEnd !== 'boolean'
            ) {
                respond({ error: 'Invalid reading activity.' });
                return false;
            }
            activityQueue = activityQueue
                .then(async () => {
                    await saveActivity(api.storage.local, {
                        username,
                        workId,
                        chapter,
                        session,
                        activeMs,
                        reachedEnd,
                    });
                    respond({ saved: true });
                })
                .catch(() => {
                    respond({ error: 'Could not save reading time.' });
                });
            return true;
        }
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
