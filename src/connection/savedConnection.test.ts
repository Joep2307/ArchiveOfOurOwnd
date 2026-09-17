import { createMemoryStorage } from '@/storage';
import { savedConnection } from './savedConnection';

it('persists account data separately for each approved website', async () => {
    const storage = createMemoryStorage({ activeUsername: 'extension-user' });
    const origin = 'http://localhost:5173';
    const first = savedConnection(storage, origin);
    await expect(
        first.access({ operation: 'get', keys: ['activeUsername'] }),
    ).rejects.toThrow('Connect AO3 first');
    await first.allow();
    await first.access({
        operation: 'set',
        items: {
            activeUsername: 'website-user',
            'library:website-user': { works: [1] },
        },
    });
    const reloaded = savedConnection(storage, origin);
    expect(await reloaded.allowed()).toBe(true);
    expect(
        await reloaded.access({
            operation: 'get',
            keys: ['activeUsername', 'library:website-user'],
        }),
    ).toEqual({
        activeUsername: 'website-user',
        'library:website-user': { works: [1] },
    });
    expect(await storage.get(['activeUsername'])).toEqual({
        activeUsername: 'extension-user',
    });
    const other = savedConnection(storage, 'https://other.test');
    await other.allow();
    expect(
        await other.access({ operation: 'get', keys: ['activeUsername'] }),
    ).toEqual({ activeUsername: undefined });
    await reloaded.revoke();
    expect(await first.allowed()).toBe(false);
    await expect(
        first.access({ operation: 'set', items: {} }),
    ).rejects.toThrow('Connect AO3 first');
});
