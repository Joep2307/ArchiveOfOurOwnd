import { formatNumber, plural } from '@/format';
import type { ReadingReview } from '@/model/Library';
import { reviewCandidates } from '@/stats/reviewCandidates';
import { el } from './el';
import { renderPanel } from './renderPanel';
import { renderSection } from './renderSection';
import { renderWorkTitle } from './renderWorkTitle';
import { workUrl } from './workUrl';
import type { ViewContext } from './ViewContext';

const ANSWERS: [ReadingReview['status'] | 'multiple', string][] = [
    ['finished', 'Read once'],
    ['multiple', 'Read multiple times'],
    ['opened', 'Not read'],
    ['unsure', 'Not sure'],
];

/** Review long and frequently visited works, independent of filters. */
export function renderReadingReview({
    state,
    controller,
}: ViewContext): HTMLElement {
    const library = state.library;
    const works = (library?.works ?? []).filter(
        (work) => work.kind === 'work',
    );
    const biggest = reviewCandidates(works);
    const reviews = library?.reviews ?? {};
    const reviewed = biggest.filter((work) => reviews[work.key]).length;
    const pending = biggest.filter(
        (work) =>
            !reviews[work.key] ||
            state.reviewSessionAnswered.includes(work.key),
    );
    const totalWords = works.reduce((sum, work) => sum + work.words, 0);
    const reviewWords = biggest.reduce((sum, work) => sum + work.words, 0);
    const coverage = totalWords
        ? Math.round((reviewWords / totalWords) * 100)
        : 0;
    const confirmed = works.reduce((sum, work) => {
        const review = reviews[work.key];
        return (
            sum +
            (review?.status === 'finished'
                ? review.words * (review.readCount ?? 1)
                : 0)
        );
    }, 0);
    const cards = pending.map((work, index) => {
        const review = reviews[work.key];
        const url = workUrl(work);
        const summary = work.summary.trim();
        const choices = el(
            'select',
            {
                className: 'input',
                attrs: {
                    'aria-label': `Reading status for ${work.title}`,
                    disabled: state.sync.running,
                },
                on: {
                    change: () => {
                        multipleReads.hidden = choices.value !== 'multiple';
                        if (choices.value === 'multiple') {
                            readCount.focus();
                            return;
                        }
                        if (!choices.value) {
                            void controller.reviewWork(work.key, null);
                            return;
                        }
                        void controller.reviewWork(
                            work.key,
                            choices.value as ReadingReview['status'],
                            choices.value === 'finished' ? 1 : undefined,
                        );
                    },
                },
            },
            el('option', {
                text: 'Choose your answer…',
                attrs: { value: '' },
            }),
            ...ANSWERS.map(([value, label]) =>
                el('option', { text: label, attrs: { value } }),
            ),
        );
        choices.value =
            review?.status === 'finished' && (review.readCount ?? 1) > 1
                ? 'multiple'
                : (review?.status ?? '');
        const readCount = el('input', {
            className: 'input',
            attrs: {
                type: 'number',
                min: 2,
                step: 1,
                value: Math.max(2, review?.readCount ?? 2),
                'aria-label': `Full reads for ${work.title}`,
                disabled: state.sync.running,
            },
        });
        const multipleReads = el(
            'div',
            { attrs: { hidden: true } },
            el(
                'label',
                {},
                el('p', { text: 'How many full reads?' }),
                readCount,
            ),
            el('p', {
                className: 'muted',
                text: 'Include your first read. AO3 visits are page openings.',
            }),
            el('button', {
                className: 'button',
                text: 'Save read count',
                attrs: { type: 'button', disabled: state.sync.running },
                on: {
                    click: () => {
                        if (
                            !readCount.checkValidity() ||
                            !Number.isSafeInteger(readCount.valueAsNumber)
                        ) {
                            readCount.reportValidity();
                            return;
                        }
                        void controller.reviewWork(
                            work.key,
                            'finished',
                            readCount.valueAsNumber,
                        );
                    },
                },
            }),
        );
        multipleReads.hidden = choices.value !== 'multiple';
        return el(
            'li',
            {},
            el('p', {}, `${index + 1}. `, renderWorkTitle(work)),
            el('p', {
                className: 'muted',
                text:
                    `${formatNumber(work.words)} words · ` +
                    plural(work.visits, 'AO3 visit'),
            }),
            el(
                'details',
                {},
                el('summary', { text: 'Show story summary' }),
                el('p', {
                    className: 'review-summary',
                    text:
                        summary ||
                        'No summary was included in your imported history.',
                }),
            ),
            url
                ? el(
                      'p',
                      {},
                      el('a', {
                          className: 'link-button',
                          text: 'Open on AO3 ↗',
                          attrs: {
                              href: url,
                              target: '_blank',
                              rel: 'noopener noreferrer',
                              'aria-label':
                                  `Open ${work.title} ` + 'on AO3 (new tab)',
                          },
                      }),
                  )
                : null,
            choices,
            multipleReads,
            review
                ? el('p', {
                      className: 'muted',
                      text: 'Saved. This work leaves the list when you close.',
                      attrs: { role: 'status' },
                  })
                : null,
        );
    });
    const completed = works.filter(
        (work) =>
            reviews[work.key] &&
            !pending.some((item) => item.key === work.key),
    );
    const history = el(
        'details',
        { className: 'review-history' },
        el('summary', { text: `Reviewed works (${completed.length})` }),
        ...completed.map((work) => {
            const review = reviews[work.key];
            if (!review) return null;
            const count = el('input', {
                className: 'input',
                attrs: {
                    type: 'number',
                    min: 1,
                    step: 1,
                    value: review.readCount ?? 1,
                    'aria-label': `Edit full reads for ${work.title}`,
                    disabled: state.sync.running,
                },
                on: {
                    change: () => {
                        if (
                            !count.checkValidity() ||
                            !Number.isSafeInteger(count.valueAsNumber)
                        ) {
                            count.reportValidity();
                            count.value = String(review.readCount ?? 1);
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
            return el(
                'div',
                { className: 'review-history__item' },
                renderWorkTitle(work),
                el('p', {
                    text:
                        review.status === 'partial'
                            ? 'Previously marked partially read'
                            : review.status === 'finished' &&
                                (review.readCount ?? 1) > 1
                              ? 'Read multiple times'
                              : (ANSWERS.find(
                                    ([status]) => status === review.status,
                                )?.[1] ?? review.status),
                }),
                review.status === 'finished' && (review.readCount ?? 1) > 1
                    ? el('label', {}, 'Full reads ', count)
                    : null,
                el('button', {
                    className: 'link-button',
                    text: 'Undo review',
                    attrs: {
                        type: 'button',
                        disabled: state.sync.running,
                        'aria-label': `Undo review for ${work.title}`,
                    },
                    on: {
                        click: () => {
                            void controller.reviewWork(work.key, null);
                        },
                    },
                }),
            );
        }),
    );
    return renderSection(
        'reading-review',
        'Check your reading history',
        renderPanel(
            {
                title: `${reviewed} of ${biggest.length} reviewed`,
                subtitle:
                    'Your 10 longest and 10 most-visited works, ' +
                    'with duplicates removed, account for ' +
                    `${coverage}% ` +
                    'of imported words. Review at your own pace; ' +
                    'answered works leave the queue when you close.',
                className: 'panel--full',
            },
            state.sync.error
                ? el('p', {
                      text: state.sync.error.message,
                      attrs: { role: 'alert' },
                  })
                : null,
            el('p', {
                text:
                    `${formatNumber(confirmed)} words confirmed, ` +
                    'including full rereads. ' +
                    'Dashboard stats update with your answers. ' +
                    'Not-read works are excluded; unreviewed, partial ' +
                    'and uncertain works remain estimates.',
            }),
            el('p', {
                className: 'muted',
                text:
                    'Choose “Read once” or “Read multiple times” if you ' +
                    'read the length ' +
                    'shown, including later chapters. Filters do ' +
                    'not change this ' +
                    'queue. New imports may change the selection; ' +
                    'previous answers ' +
                    'stay saved.',
            }),
            pending.length === 0
                ? el('p', {
                      text: 'All caught up! You have reviewed this selection.',
                      attrs: { role: 'status' },
                  })
                : el(
                      'ul',
                      {
                          className: 'reading-review-list',
                          attrs: { 'aria-label': 'Works to review' },
                      },
                      ...cards,
                  ),
            completed.length ? history : null,
        ),
    );
}
