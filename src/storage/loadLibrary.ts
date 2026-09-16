import type { Library } from '@/model';
import { isLibrary } from './isLibrary';
import { libraryKey } from './libraryKey';
import type { StorageArea } from './StorageArea';

/** Loads the stored library of one account. */
export async function loadLibrary(
    storage: StorageArea,
    username: string,
): Promise<Library | null> {
    const key = libraryKey(username);
    const stored = await storage.get([key]);
    const library = stored[key];
    return isLibrary(library) ? library : null;
}
