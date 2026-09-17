import type { StorageArea } from '@/storage';
import { messageRecord } from './protocol';

/** Keep each website's data separate from the extension dashboard. */
export function savedConnection(storage: StorageArea, origin: string) {
    const prefix = `dashboard:${origin}:`;
    const grantKey = `${prefix}permission`;
    const dataKey = (key: string): string => `${prefix}data:${key}`;
    return {
        async allowed(): Promise<boolean> {
            return (await storage.get([grantKey]))[grantKey] === true;
        },
        async allow(): Promise<void> {
            await storage.set({ [grantKey]: true });
        },
        async revoke(): Promise<void> {
            await storage.remove([grantKey]);
        },
        async access(value: unknown): Promise<unknown> {
            if (!(await this.allowed())) throw new Error('Connect AO3 first.');
            const payload = messageRecord(value);
            const keys: string[] = Array.isArray(payload.keys)
                ? payload.keys.filter(
                      (key): key is string => typeof key === 'string',
                  )
                : [];
            if (payload.operation === 'get') {
                const items = await storage.get(keys.map(dataKey));
                return Object.fromEntries(
                    keys.map((key) => [key, items[dataKey(key)]]),
                );
            }
            if (payload.operation === 'set') {
                const items = messageRecord(payload.items);
                await storage.set(
                    Object.fromEntries(
                        Object.entries(items).map(([key, value]) => [
                            dataKey(key),
                            value,
                        ]),
                    ),
                );
            } else if (payload.operation === 'remove') {
                await storage.remove(keys.map(dataKey));
            } else {
                throw new Error('Unknown storage operation.');
            }
            return true;
        },
    };
}
