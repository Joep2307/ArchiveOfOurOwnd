import { createMemoryStorage, type StorageArea } from '@/storage';
import { bridgeRequest } from './pageBridge';

export const CONNECTION_KEY = 'reading-stats-connected';

/** Demo imports remain in memory; connected accounts use extension storage. */
export function bridgeStorage(connected: () => boolean): StorageArea {
    const memory = createMemoryStorage();
    return {
        get: (keys) =>
            connected()
                ? bridgeRequest('storage', undefined, undefined, {
                      operation: 'get',
                      keys,
                  })
                : memory.get(keys),
        async set(items) {
            if (connected()) {
                await bridgeRequest('storage', undefined, undefined, {
                    operation: 'set',
                    items,
                });
            } else await memory.set(items);
        },
        async remove(keys) {
            if (connected()) {
                await bridgeRequest('storage', undefined, undefined, {
                    operation: 'remove',
                    keys,
                });
            } else await memory.remove(keys);
        },
    };
}
