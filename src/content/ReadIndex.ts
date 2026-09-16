import type { Work } from '@/model';

/**
 * Work ids you have read. The value is the synced work, or `null`
 * when the work was opened after the last sync.
 */
export type ReadIndex = ReadonlyMap<number, Work | null>;
