import {
    formatCompact,
    formatDate,
    formatDuration,
    formatNumber,
} from '@/format';
import type { Stats } from '@/stats';
import { el } from './el';
import { renderStatTile } from './renderStatTile';

function percent(part: number, whole: number): string {
    return whole > 0 ? `${Math.round((part / whole) * 100)}%` : '—';
}

function perAuthor(works: number, authors: number): string {
    const value = works / Math.max(1, authors);
    return value >= 10 ? formatNumber(value) : value.toFixed(1);
}

/** The row of headline numbers. */
export function renderOverview(
    stats: Stats,
    wordsPerMinute: number,
): HTMLElement {
    const { totals, wordSummary, visitSummary } = stats;
    const hidden = totals.deleted + totals.mystery;
    const novels =
        totals.novels >= 10
            ? formatNumber(totals.novels)
            : totals.novels.toFixed(1);

    const range =
        totals.firstVisited && totals.lastVisited
            ? `Last visits between ${formatDate(totals.firstVisited)} ` +
              `and ${formatDate(totals.lastVisited)}.`
            : '';
    const busiest = stats.busiestMonth
        ? ` Busiest month: ${stats.busiestMonth.label} ` +
          `(${formatNumber(stats.busiestMonth.works)} works).`
        : '';

    return el(
        'section',
        {
            className: 'section section--overview',
            attrs: { id: 'overview', 'aria-labelledby': 'overview-h' },
        },
        el('h2', {
            className: 'section__title',
            text: 'Overview',
            attrs: { id: 'overview-h' },
        }),
        el('p', { className: 'section__lead', text: range + busiest }),
        el('p', {
            className: 'section__lead',
            text:
                `${formatNumber(totals.confirmedWords)} confirmed words + ` +
                `${formatNumber(totals.estimatedWords)} estimated words. ` +
                'Reviews update these stats. Not-read works are excluded; ' +
                'unreviewed and uncertain works remain estimates. ' +
                'Active reading time adds estimates; your own reviews ' +
                'provide confirmations.',
        }),
        el(
            'div',
            { className: 'tiles' },
            renderStatTile(
                'Works read',
                formatNumber(totals.works),
                hidden > 0
                    ? `plus ${formatNumber(hidden)} deleted or hidden`
                    : undefined,
            ),
            renderStatTile(
                'Words read',
                formatCompact(totals.words),
                `about ${novels} novels`,
            ),
            renderStatTile(
                'Estimated reading time',
                `~${formatDuration(totals.readingMinutes)}`,
                `based on ${formatNumber(wordsPerMinute)} words a ` +
                    'minute (change it under Advanced)',
            ),
            renderStatTile(
                'AO3 visits',
                formatNumber(totals.visits),
                `${visitSummary.mean.toFixed(1)} per work on average`,
            ),
            renderStatTile(
                'Average length',
                formatNumber(wordSummary.mean),
                `median ${formatNumber(wordSummary.median)} words`,
            ),
            renderStatTile(
                'Completed',
                percent(totals.complete, totals.works),
                `${formatNumber(totals.inProgress)} works in progress`,
            ),
            renderStatTile(
                'Confirmed re-reads',
                formatNumber(totals.rereads),
                'works you confirmed reading more than once',
            ),
            renderStatTile(
                'Authors',
                formatNumber(totals.authors),
                `${perAuthor(totals.works, totals.authors)} works each`,
            ),
            renderStatTile('Fandoms', formatNumber(totals.fandoms)),
            renderStatTile(
                'Ships',
                formatNumber(totals.relationships),
                `${formatNumber(totals.characters)} characters`,
            ),
            renderStatTile(
                'Tags',
                formatNumber(totals.tags),
                `${formatNumber(totals.series)} series`,
            ),
            renderStatTile(
                'Updates waiting',
                formatNumber(totals.updatesAvailable),
                `${formatNumber(totals.markedForLater)} marked for later`,
            ),
        ),
    );
}
