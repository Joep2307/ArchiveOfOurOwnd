import { HIGHLIGHT_KEY } from './constants';
import type { StorageArea } from './StorageArea';

/** Whether read works are highlighted on AO3; on by default. */
export async function loadHighlightSetting(
    storage: StorageArea,
): Promise<boolean> {
    const stored = await storage.get([HIGHLIGHT_KEY]);
    return stored[HIGHLIGHT_KEY] !== false;
}
