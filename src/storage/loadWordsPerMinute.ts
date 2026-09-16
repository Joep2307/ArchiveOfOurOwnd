import { clampWordsPerMinute } from '@/stats';
import { WORDS_PER_MINUTE_KEY } from './constants';
import type { StorageArea } from './StorageArea';

/** The reader's own reading speed; the average if never set. */
export async function loadWordsPerMinute(
    storage: StorageArea,
): Promise<number> {
    const stored = await storage.get([WORDS_PER_MINUTE_KEY]);
    return clampWordsPerMinute(stored[WORDS_PER_MINUTE_KEY]);
}
