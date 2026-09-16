export type { StorageArea } from './StorageArea';
export {
    ACTIVE_USER_KEY,
    HIGHLIGHT_KEY,
    LIBRARY_KEY_PREFIX,
    OPENED_KEY_PREFIX,
} from './constants';
export { addOpenedWorkId } from './addOpenedWorkId';
export { clearLibrary } from './clearLibrary';
export { createMemoryStorage } from './createMemoryStorage';
export { getExtensionStorage } from './getExtensionStorage';
export { isLibrary } from './isLibrary';
export { libraryKey } from './libraryKey';
export { loadActiveLibrary } from './loadActiveLibrary';
export { loadHighlightSetting } from './loadHighlightSetting';
export { loadLibrary } from './loadLibrary';
export { loadOpenedWorkIds } from './loadOpenedWorkIds';
export { openedKey } from './openedKey';
export { saveHighlightSetting } from './saveHighlightSetting';
export { saveLibrary } from './saveLibrary';
