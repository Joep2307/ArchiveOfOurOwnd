import type { Work } from '@/model';

/** Ordering and labelling options for `countFacet`. */
export type CountOptions = {
    /** Fixed order of values; others are appended by count. */
    order?: readonly string[];
    /** Keep values in `order` even when their count is 0. */
    keepEmpty?: boolean;
    label?: (value: string) => string;
    /** Words actually read for a work; defaults to its word count. */
    wordsRead?: (work: Work) => number;
};
