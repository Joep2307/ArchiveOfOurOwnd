import type { SeriesRef } from '@/model';
import { parseCount } from './parseCount';
import { textOf } from './textOf';

/** Reads the "Part N of Series" lines of a blurb. */
export function parseSeries(item: Element): SeriesRef[] {
    const series: SeriesRef[] = [];
    for (const li of Array.from(item.querySelectorAll('ul.series li'))) {
        const link = li.querySelector('a[href*="/series/"]');
        const match = /\/series\/(\d+)/.exec(link?.getAttribute('href') ?? '');
        if (!link || !match) {
            continue;
        }
        series.push({
            id: Number(match[1]),
            title: textOf(link),
            part: parseCount(textOf(li.querySelector('strong'))),
        });
    }
    return series;
}
