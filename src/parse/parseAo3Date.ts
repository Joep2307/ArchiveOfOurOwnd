import { MONTHS, MS_PER_UNIT } from './constants';
import { toIsoDate } from './toIsoDate';

const ABSOLUTE = /(\d{1,2})\s+([A-Za-z]{3})[A-Za-z]*\s+(\d{4})/;
const RELATIVE =
    /(?:(\d+)|an?|half an?)\s*(second|minute|hour|day|month|year)s?/i;

/**
 * Parses a date as AO3 prints it and returns `YYYY-MM-DD`.
 *
 * AO3 shows `05 Mar 2024` for older dates and words like
 * `3 days` or `about 2 hours` for the last 30 days; those are
 * resolved against `now`. Returns `null` when nothing matches.
 */
export function parseAo3Date(text: string, now: Date): string | null {
    const absolute = ABSOLUTE.exec(text);
    if (absolute) {
        const [, day, monthName, year] = absolute;
        const month = MONTHS.indexOf((monthName ?? '').toLowerCase());
        if (month >= 0) {
            return toIsoDate(new Date(Number(year), month, Number(day)));
        }
    }

    if (/less than|just now|seconds?\b/i.test(text)) {
        return toIsoDate(now);
    }

    const relative = RELATIVE.exec(text);
    if (relative) {
        const amount = relative[1] ? Number(relative[1]) : 1;
        const unit = (relative[2] ?? '').toLowerCase();
        const ms = (MS_PER_UNIT[unit] ?? 0) * amount;
        return toIsoDate(new Date(now.getTime() - ms));
    }

    return null;
}
