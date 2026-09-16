import { getBrowserApi } from '@/browser';
import type { StorageArea } from './StorageArea';

/** `storage.local` of the extension, or `null` outside it. */
export function getExtensionStorage(): StorageArea | null {
    const api = getBrowserApi();
    return api ? api.storage.local : null;
}
