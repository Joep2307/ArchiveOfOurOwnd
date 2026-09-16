import { MAX_OPENED_IDS } from './constants';
import { loadOpenedWorkIds } from './loadOpenedWorkIds';
import { openedKey } from './openedKey';
import type { StorageArea } from './StorageArea';

/** Remembers that a work was opened, newest first. */
export async function addOpenedWorkId(
    storage: StorageArea,
    username: string,
    id: number,
): Promise<void> {
    const ids = await loadOpenedWorkIds(storage, username);
    if (ids[0] === id) {
        return;
    }
    const next = [id, ...ids.filter((known) => known !== id)];
    await storage.set({
        [openedKey(username)]: next.slice(0, MAX_OPENED_IDS),
    });
}
