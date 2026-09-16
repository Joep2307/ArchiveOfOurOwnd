import type { StorageArea } from './StorageArea';

/** In-memory storage for tests and the local preview. */
export function createMemoryStorage(
    initial: Record<string, unknown> = {},
): StorageArea {
    const data = new Map<string, unknown>(Object.entries(initial));
    return {
        get(keys) {
            const result: Record<string, unknown> = {};
            for (const key of keys) {
                if (data.has(key)) {
                    result[key] = structuredClone(data.get(key));
                }
            }
            return Promise.resolve(result);
        },
        set(items) {
            for (const [key, value] of Object.entries(items)) {
                data.set(key, structuredClone(value));
            }
            return Promise.resolve();
        },
        remove(keys) {
            for (const key of keys) {
                data.delete(key);
            }
            return Promise.resolve();
        },
    };
}
