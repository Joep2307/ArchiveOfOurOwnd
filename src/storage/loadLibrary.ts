import type { Library } from '@/model';
import { isLibrary } from './isLibrary';
import { libraryKey } from './libraryKey';
import type { StorageArea } from './StorageArea';
import {
    activityKey,
    applyActivity,
    type ReadingActivity,
} from '@/content/readingActivity';
import { loadWordsPerMinute } from './loadWordsPerMinute';

/** Loads the stored library of one account. */
export async function loadLibrary(
    storage: StorageArea,
    username: string,
): Promise<Library | null> {
    const key = libraryKey(username);
    const stored = await storage.get([key]);
    const library = stored[key];
    if (!isLibrary(library)) return null;
    const activity = activityKey(username);
    const [tracked, pace] = await Promise.all([
        storage.get([activity]),
        loadWordsPerMinute(storage),
    ]);
    if (!tracked[activity]) return library;
    return applyActivity(
        library,
        tracked[activity] as Record<string, ReadingActivity>,
        pace,
    );
}
