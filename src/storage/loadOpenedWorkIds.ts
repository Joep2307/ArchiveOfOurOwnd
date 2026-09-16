import { openedKey } from './openedKey';
import type { StorageArea } from './StorageArea';

/** Work ids opened on AO3 since they were last synced. */
export async function loadOpenedWorkIds(
    storage: StorageArea,
    username: string,
): Promise<number[]> {
    const key = openedKey(username);
    const stored = await storage.get([key]);
    const ids = stored[key];
    return Array.isArray(ids)
        ? ids.filter((id): id is number => Number.isInteger(id))
        : [];
}
