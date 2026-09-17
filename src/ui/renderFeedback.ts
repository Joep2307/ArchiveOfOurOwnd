import type { DashboardController, DashboardState } from '@/app';
import { countFeedback } from '@/feedback';
import { formatNumber, plural } from '@/format';
import type { Work } from '@/model';
import { el } from './el';
import { renderStatTile } from './renderStatTile';

function share(part: number, whole: number): string {
    return `${Math.round((part / Math.max(1, whole)) * 100)}%`;
}

/** How many of the matching works the reader gave kudos or comments. */
export function renderFeedback(
    state: DashboardState,
    controller: DashboardController,
    works: readonly Work[],
): HTMLElement {
    const totals = countFeedback(works, state.library?.feedback ?? {});
    const checked = totals.checked > 0;
    const canCheck =
        !state.sync.running &&
        !state.demo &&
        (!state.standalone || state.accountConnected);

    const lead = !checked
        ? 'AO3 doesn’t list the works you gave kudos or commented on, ' +
          'so the extension opens each work’s kudos and comment pages ' +
          'to look for your name. It goes slowly to be kind to AO3, so ' +
          'a big history can take a few hours. Stop any time; the next ' +
          'check goes on from there.'
        : totals.unchecked > 0
          ? `${plural(totals.unchecked, 'work')} not checked yet.`
          : `Out of ${plural(totals.checked, 'work')} you read.`;

    return el(
        'section',
        {
            className: 'section section--feedback',
            attrs: { id: 'feedback', 'aria-labelledby': 'feedback-h' },
        },
        el('h2', {
            className: 'section__title',
            text: 'Kudos and comments you left',
            attrs: { id: 'feedback-h' },
        }),
        el(
            'p',
            { className: 'section__lead' },
            `${lead} `,
            totals.unchecked > 0
                ? el('button', {
                      className: `button${checked ? '' : ' button--primary'}`,
                      text: checked
                          ? 'Check the rest'
                          : 'Check kudos and comments',
                      attrs: { type: 'button', disabled: !canCheck },
                      on: { click: () => void controller.checkFeedback() },
                  })
                : null,
        ),
        checked
            ? el(
                  'div',
                  { className: 'tiles' },
                  renderStatTile(
                      'Kudos given',
                      formatNumber(totals.kudos),
                      `on ${share(totals.kudos, totals.checked)} of ` +
                          'checked works',
                  ),
                  renderStatTile(
                      'Commented on',
                      formatNumber(totals.commented),
                      `${share(totals.commented, totals.checked)} of ` +
                          'checked works',
                  ),
              )
            : null,
    );
}
