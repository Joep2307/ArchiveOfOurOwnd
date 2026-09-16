import { WORDS_PER_MINUTE_KEY } from './constants';
import type { StorageArea } from './StorageArea';

export async function saveWordsPerMinute(
    storage: StorageArea,
    wordsPerMinute: number,
): Promise<void> {
    await storage.set({ [WORDS_PER_MINUTE_KEY]: wordsPerMinute });
}
