import type { FetchText, FetchTextResult } from '@/sync';
import { SyncError } from '@/sync';
import { BRIDGE, messageRecord } from './protocol';

export function bridgeRequest<T>(
    action: string,
    url?: string,
    signal?: AbortSignal,
    payload?: unknown,
): Promise<T> {
    const checking = action === 'ping' || action === 'resume';
    return new Promise((resolve, reject) => {
        const id = crypto.randomUUID();
        const finish = (error?: Error, result?: T): void => {
            clearTimeout(timer);
            window.removeEventListener('message', receive);
            signal?.removeEventListener('abort', abort);
            if (error) reject(error);
            else resolve(result as T);
        };
        const receive = (event: MessageEvent): void => {
            const data = messageRecord(event.data);
            if (
                event.source !== window ||
                event.origin !== location.origin ||
                data.channel !== BRIDGE ||
                data.direction !== 'response' ||
                data.id !== id
            )
                return;
            finish(
                typeof data.error === 'string'
                    ? new Error(data.error)
                    : undefined,
                data.result as T,
            );
        };
        const abort = (): void => {
            finish(new DOMException('Sync stopped.', 'AbortError'));
        };
        const timer = setTimeout(
            () => {
                finish(
                    new Error(
                        checking
                            ? 'Install or reload the Reading Stats ' +
                                  'extension ' +
                                  'in this browser, then refresh this demo ' +
                                  'and connect again.'
                            : 'AO3 did not respond. Try connecting again.',
                    ),
                );
            },
            checking ? 5000 : action === 'connect' ? 300000 : 60000,
        );
        if (signal?.aborted) {
            abort();
            return;
        }
        window.addEventListener('message', receive);
        signal?.addEventListener('abort', abort, { once: true });
        window.postMessage(
            {
                channel: BRIDGE,
                direction: 'request',
                id,
                action,
                url,
                payload,
            },
            location.origin,
        );
    });
}

export const bridgeFetchText: FetchText = async (url, signal) => {
    try {
        const response = await bridgeRequest<{
            result?: FetchTextResult;
            error?: string;
        }>('fetch', url, signal);
        if (!response.result)
            throw new Error(response.error ?? 'Could not read AO3.');
        return response.result;
    } catch (error) {
        if (signal?.aborted) throw new SyncError('aborted', 'Sync stopped.');
        throw new SyncError(
            'network',
            error instanceof Error ? error.message : 'Could not read AO3.',
        );
    }
};
