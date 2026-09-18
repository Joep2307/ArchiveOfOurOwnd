import type { Work } from '@/model';
import { authorLabel } from './authorLabel';
import { el } from './el';
import { renderEmpty } from './renderEmpty';
import { renderWorkTitle } from './renderWorkTitle';
import type { DashboardController, DashboardState } from '@/app';
import { activityLabel } from './activityLabel';
import { renderExpandableList } from './renderExpandableList';

export function reviewControl(
    work: Work,
    state: DashboardState,
    controller: DashboardController,
): HTMLElement {
    const review = state.library?.reviews?.[work.key];
    const select = el(
        'select',
        {
            className: 'input',
            attrs: {
                'aria-label': `Review ${work.title}`,
                disabled: state.sync.running,
            },
            on: {
                change: () => {
                    if (select.value === 'multiple') {
                        count.hidden = false;
                        save.hidden = false;
                        count.focus();
                        return;
                    }
                    count.hidden = true;
                    save.hidden = true;
                    void controller.reviewWork(
                        work.key,
                        select.value
                            ? (select.value as
                                  'finished' | 'opened' | 'unsure')
                            : null,
                        select.value === 'finished' ? 1 : undefined,
                    );
                },
            },
        },
        el('option', { text: 'Review', attrs: { value: '' } }),
        el('option', { text: 'Read once', attrs: { value: 'finished' } }),
        el('option', { text: 'Not read', attrs: { value: 'opened' } }),
        el('option', { text: 'Not sure', attrs: { value: 'unsure' } }),
        el('option', {
            text: 'Read multiple times',
            attrs: { value: 'multiple' },
        }),
    );
    select.value =
        review?.status === 'finished' && (review.readCount ?? 1) > 1
            ? 'multiple'
            : (review?.status ?? '');
    const count = el('input', {
        className: 'input',
        attrs: {
            type: 'number',
            min: 2,
            step: 1,
            value: Math.max(2, review?.readCount ?? 2),
            'aria-label': `Reads for ${work.title}`,
            hidden: true,
            disabled: state.sync.running,
        },
    });
    const save = el('button', {
        className: 'button button--ghost',
        text: 'Save',
        attrs: { type: 'button', hidden: true, disabled: state.sync.running },
        on: {
            click: () => {
                if (
                    !count.checkValidity() ||
                    !Number.isSafeInteger(count.valueAsNumber)
                ) {
                    count.reportValidity();
                    return;
                }
                void controller.reviewWork(
                    work.key,
                    'finished',
                    count.valueAsNumber,
                );
            },
        },
    });
    if (select.value === 'multiple') {
        count.hidden = false;
        save.hidden = false;
    }
    return el(
        'details',
        { className: 'work-list__review' },
        el('summary', { className: 'button button--ghost', text: 'Review' }),
        el(
            'div',
            { className: 'work-list__review-controls' },
            review?.source === 'activity'
                ? el('p', {
                      className: 'muted',
                      text:
                          `${Math.round((review.activeMs ?? 0) / 60000)} ` +
                          'minutes active reading. Estimated: ' +
                          (review.status === 'finished'
                              ? 'likely finished.'
                              : review.status === 'opened'
                                ? 'just opened.'
                                : 'partly read.') +
                          ' You can correct this below.',
                  })
                : null,
            select,
            count,
            save,
        ),
    );
}

/** Ranked list of works with one highlighted number each. */
export function renderWorkList(
    works: readonly Work[],
    metric: (work: Work) => string,
    emptyText: string,
    state?: DashboardState,
    controller?: DashboardController,
    listId?: string,
    limit = 10,
): HTMLElement {
    if (listId && state && controller) {
        return renderExpandableList(
            works,
            limit,
            listId,
            state,
            controller,
            (shown) =>
                renderWorkList(shown, metric, emptyText, state, controller),
        );
    }
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
                    state?.library?.reviews?.[work.key]?.source === 'activity'
                        ? el('span', {
                              className: 'work-list__meta',
                              text: activityLabel(
                                  state.library.reviews[work.key],
                              ),
                          })
                        : null,
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
                state && controller
                    ? reviewControl(work, state, controller)
                    : null,
            ),
        ),
    );
}
