import type { Library } from '@/model';
import { ACTIVE_USER_KEY } from './constants';
import { libraryKey } from './libraryKey';
import type { StorageArea } from './StorageArea';

/** Stores a library and makes its account the active one. */
export async function saveLibrary(
    storage: StorageArea,
    library: Library,
): Promise<void> {
    await storage.set({
        [libraryKey(library.username)]: library,
        [ACTIVE_USER_KEY]: library.username,
    });
}
