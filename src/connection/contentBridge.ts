import type { BrowserApi } from '@/browser';
import { BRIDGE, isDashboardUrl, messageRecord } from './protocol';
import { savedConnection } from './savedConnection';

export function startDashboardBridge(api: BrowserApi): () => void {
    if (window.top !== window || !isDashboardUrl(location.href)) {
        return () => undefined;
    }
    const saved = savedConnection(api.storage.local, location.origin);
    const receive = (event: MessageEvent): void => {
        if (event.source !== window || event.origin !== location.origin)
            return;
        const message = messageRecord(event.data);
        if (
            message.channel !== BRIDGE ||
            message.direction !== 'request' ||
            typeof message.id !== 'string'
        )
            return;
        const reply = (result: unknown, error?: string): void => {
            window.postMessage(
                {
                    channel: BRIDGE,
                    direction: 'response',
                    id: message.id,
                    result,
                    error,
                },
                location.origin,
            );
        };
        const handle = async (): Promise<void> => {
            if (message.action === 'ping') {
                reply(true);
            } else if (message.action === 'resume') {
                reply(await saved.allowed());
            } else if (message.action === 'connect') {
                const connected =
                    (await saved.allowed()) ||
                    window.confirm(
                        'Allow this dashboard to read your AO3 history ' +
                            'using the extension? It will be visible ' +
                            'to this website until you disconnect. ' +
                            'Your connection and history are remembered. ' +
                            'Your password stays on AO3.',
                    );
                if (connected) await saved.allow();
                reply(connected);
            } else if (message.action === 'disconnect') {
                await saved.revoke();
                reply(true);
            } else if (message.action === 'storage') {
                reply(await saved.access(message.payload));
            } else if (message.action === 'fetch' && (await saved.allowed())) {
                void api.runtime
                    .sendMessage({ type: BRIDGE, url: message.url })
                    .then(
                        (result) => {
                            reply(result);
                        },
                        () => {
                            reply(
                                null,
                                'The extension could not reach AO3. ' +
                                    'Reload the extension and try again.',
                            );
                        },
                    );
            } else {
                reply(null, 'Connect your AO3 account again.');
            }
        };
        void handle().catch(() => {
            reply(
                null,
                'Could not restore or save your connection. Try again.',
            );
        });
    };
    window.addEventListener('message', receive);
    return () => {
        window.removeEventListener('message', receive);
    };
}
