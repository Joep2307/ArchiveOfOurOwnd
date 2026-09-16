/** Lower edges of the word-count buckets. */
export const WORD_BUCKET_EDGES = [
    0, 1_000, 5_000, 10_000, 20_000, 50_000, 100_000, 200_000,
];

export const WORD_BUCKET_LABELS = [
    'Under 1k',
    '1k–5k',
    '5k–10k',
    '10k–20k',
    '20k–50k',
    '50k–100k',
    '100k–200k',
    '200k+',
];

/** Average adult silent reading speed, words per minute. */
export const WORDS_PER_MINUTE = 250;

/** Range a personal reading speed is kept within. */
export const MIN_WORDS_PER_MINUTE = 50;
export const MAX_WORDS_PER_MINUTE = 1500;

/** A typical novel, for the "that's N novels" comparison. */
export const WORDS_PER_NOVEL = 90_000;

export const MONTH_LABELS = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
];
