/** The subset of `storage.local` the extension uses. */
export type StorageArea = {
    get(keys: string[]): Promise<Record<string, unknown>>;
    set(items: Record<string, unknown>): Promise<void>;
    remove(keys: string[]): Promise<void>;
};
