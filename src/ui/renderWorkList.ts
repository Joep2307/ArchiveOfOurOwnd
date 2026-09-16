import type { Work } from '@/model';
import { authorLabel } from './authorLabel';
import { el } from './el';
import { renderEmpty } from './renderEmpty';
import { renderWorkTitle } from './renderWorkTitle';

/** Ranked list of works with one highlighted number each. */
export function renderWorkList(
    works: readonly Work[],
    metric: (work: Work) => string,
    emptyText: string,
): HTMLElement {
    if (works.length === 0) {
        return renderEmpty(emptyText);
    }
    return el(
        'ol',
        { className: 'work-list' },
        ...works.map((work) =>
            el(
                'li',
                { className: 'work-list__item' },
                el(
                    'div',
                    { className: 'work-list__main' },
                    renderWorkTitle(work),
                    el('span', {
                        className: 'work-list__meta',
                        text: [authorLabel(work), work.fandoms.join(', ')]
                            .filter(Boolean)
                            .join(' · '),
                    }),
                ),
                el('span', {
                    className: 'work-list__metric',
                    text: metric(work),
                }),
            ),
        ),
    );
}
