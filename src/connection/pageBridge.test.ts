import { bridgeFetchText, bridgeRequest } from './pageBridge';
import { BRIDGE } from './protocol';

describe('page connection', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('reports a missing extension', async () => {
        vi.useFakeTimers();
        const result = bridgeRequest('ping');
        const failure = expect(result).rejects.toThrow('Install or reload');
        await vi.advanceTimersByTimeAsync(5000);
        await failure;
    });

    it('checks response origin and request ID', async () => {
        const post = vi
            .spyOn(window, 'postMessage')
            .mockImplementation(() => undefined);
        const result = bridgeRequest<boolean>('connect');
        const request = post.mock.calls[0]?.[0] as { id: string };
        const response = (
            origin: string,
            id: string,
            value: boolean,
        ): void => {
            window.dispatchEvent(
                new MessageEvent('message', {
                    source: window,
                    origin,
                    data: {
                        channel: BRIDGE,
                        direction: 'response',
                        id,
                        result: value,
                    },
                }),
            );
        };
        response('https://evil.test', request.id, false);
        response(location.origin, 'wrong-id', false);
        response(location.origin, request.id, true);
        await expect(result).resolves.toBe(true);
    });

    it('stops a read when sync is cancelled', async () => {
        const abort = new AbortController();
        const result = bridgeFetchText(
            'https://archiveofourown.org/',
            abort.signal,
        );
        abort.abort();
        await expect(result).rejects.toMatchObject({ code: 'aborted' });
    });
});
