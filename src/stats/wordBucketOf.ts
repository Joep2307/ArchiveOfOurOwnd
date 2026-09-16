import { WORD_BUCKET_EDGES, WORD_BUCKET_LABELS } from './constants';

/** Label of the word-count bucket `words` falls in. */
export function wordBucketOf(words: number): string {
    let index = 0;
    WORD_BUCKET_EDGES.forEach((edge, i) => {
        if (words >= edge) {
            index = i;
        }
    });
    return WORD_BUCKET_LABELS[index] ?? '';
}
