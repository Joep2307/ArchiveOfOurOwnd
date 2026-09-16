export const AO3_ORIGIN = 'https://archiveofourown.org';

/** Longest summary we keep, to keep storage small. */
export const MAX_SUMMARY_LENGTH = 500;

export const MONTHS = [
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec',
];

export const MS_PER_UNIT: Readonly<Record<string, number>> = {
    second: 1000,
    minute: 60_000,
    hour: 3_600_000,
    day: 86_400_000,
    month: 30 * 86_400_000,
    year: 365 * 86_400_000,
};
