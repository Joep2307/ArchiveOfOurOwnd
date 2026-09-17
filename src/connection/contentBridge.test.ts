import type { BrowserApi } from '@/browser';
import { startDashboardBridge } from './contentBridge';
import { BRIDGE } from './protocol';
import { createMemoryStorage } from '@/storage';

vi.mock('./protocol', async (original) => ({
    ...(await original<typeof import('./protocol')>()),
    isDashboardUrl: () => true,
}));

it('remembers consent across reloads until disconnect', async () => {
    const sendMessage = vi.fn().mockResolvedValue({ result: {} });
    const api = {
        runtime: { sendMessage },
        storage: {
            local: createMemoryStorage(),
        },
    } as unknown as BrowserApi;
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const post = vi
        .spyOn(window, 'postMessage')
        .mockImplementation(() => undefined);
    let cleanup = startDashboardBridge(api);
    let nextId = 0;
    const request = async (action: string): Promise<void> => {
        const id = String(++nextId);
        window.dispatchEvent(
            new MessageEvent('message', {
                source: window,
                origin: location.origin,
                data: {
                    channel: BRIDGE,
                    direction: 'request',
                    id,
                    action,
                    url: 'https://archiveofourown.org/',
                },
            }),
        );
        await vi.waitFor(() => {
            expect(post).toHaveBeenCalledWith(
                expect.objectContaining({
                    id,
                    direction: 'response',
                }),
                location.origin,
            );
        });
    };
    try {
        await request('fetch');
        expect(sendMessage).not.toHaveBeenCalled();
        await request('connect');
        await request('fetch');
        expect(sendMessage).not.toHaveBeenCalled();
        confirm.mockReturnValue(true);
        await request('connect');
        await request('fetch');
        expect(sendMessage).toHaveBeenCalledTimes(1);
        cleanup();
        cleanup = startDashboardBridge(api);
        await request('resume');
        expect(post).toHaveBeenLastCalledWith(
            expect.objectContaining({
                result: true,
            }),
            location.origin,
        );
        await request('fetch');
        expect(sendMessage).toHaveBeenCalledTimes(2);
        expect(confirm).toHaveBeenCalledTimes(2);
        await request('disconnect');
        cleanup();
        cleanup = startDashboardBridge(api);
        await request('resume');
        expect(post).toHaveBeenLastCalledWith(
            expect.objectContaining({
                result: false,
            }),
            location.origin,
        );
        await request('fetch');
        expect(sendMessage).toHaveBeenCalledTimes(2);
    } finally {
        cleanup();
        confirm.mockRestore();
        post.mockRestore();
    }
});
