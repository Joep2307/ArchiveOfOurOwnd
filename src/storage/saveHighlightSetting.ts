import { HIGHLIGHT_KEY } from './constants';
import type { StorageArea } from './StorageArea';

export async function saveHighlightSetting(
    storage: StorageArea,
    enabled: boolean,
): Promise<void> {
    await storage.set({ [HIGHLIGHT_KEY]: enabled });
}
