import type { BrowserApi } from '@/browser';
import { createMemoryStorage } from '@/storage';
import { ACTIVITY_MESSAGE, activityKey } from '@/content/readingActivity';
import { startBackground } from './startBackground';

it('checks the fic origin and serializes saved updates', async () => {
    type Listener = Parameters<
        BrowserApi['runtime']['onMessage']['addListener']
    >[0];
    const onMessage = vi.fn<(listener: Listener) => void>();
    const storage = createMemoryStorage();
    const api = {
        storage: { local: storage },
        action: { onClicked: { addListener: vi.fn() } },
        runtime: {
            onMessage: { addListener: onMessage },
            onInstalled: { addListener: vi.fn() },
        },
    } as unknown as BrowserApi;
    startBackground(api);
    const receive = onMessage.mock.calls[0]?.[0];
    if (!receive) throw new Error('Missing listener');
    const message = {
        type: ACTIVITY_MESSAGE,
        username: 'reader',
        workId: 42,
        chapter: 1,
        session: 'test',
        activeMs: 10000,
        reachedEnd: true,
    };
    const rejected = vi.fn();
    receive(message, { url: 'http://localhost:5173', frameId: 0 }, rejected);
    expect(rejected).toHaveBeenCalledWith(
        expect.objectContaining({
            error: 'Invalid reading activity.',
        }),
    );
    expect(await storage.get([activityKey('reader')])).toEqual({});
    const sender = { url: 'https://archiveofourown.org/works/42', frameId: 0 };
    await Promise.all(
        [10000, 20000].map(
            (activeMs) =>
                new Promise((resolve) => {
                    receive({ ...message, activeMs }, sender, resolve);
                }),
        ),
    );
    expect(await storage.get([activityKey('reader')])).toMatchObject({
        [activityKey('reader')]: { 'work-42': { activeMs: 20000 } },
    });
});
