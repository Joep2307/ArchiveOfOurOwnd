import type { Library } from '@/model';
import { ACTIVE_USER_KEY } from './constants';
import { loadLibrary } from './loadLibrary';
import type { StorageArea } from './StorageArea';

/** Loads the library of the account that was synced last. */
export async function loadActiveLibrary(
    storage: StorageArea,
): Promise<Library | null> {
    const active = await storage.get([ACTIVE_USER_KEY]);
    const username = active[ACTIVE_USER_KEY];
    if (typeof username !== 'string') {
        return null;
    }
    return loadLibrary(storage, username);
}
