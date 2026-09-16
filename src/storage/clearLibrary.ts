import { ACTIVE_USER_KEY } from './constants';
import { libraryKey } from './libraryKey';
import { openedKey } from './openedKey';
import type { StorageArea } from './StorageArea';

/** Deletes the stored history of one account. */
export async function clearLibrary(
    storage: StorageArea,
    username: string,
): Promise<void> {
    await storage.remove([
        libraryKey(username),
        openedKey(username),
        ACTIVE_USER_KEY,
    ]);
}
