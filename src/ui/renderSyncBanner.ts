import type { DashboardController, DashboardState } from '@/app';
import { formatNumber } from '@/format';
import { AO3_ORIGIN } from '@/parse';
import { el } from './el';

const HELP: Record<string, string> = {
    'logged-out':
        'Log in to AO3 in this browser (tick “Remember me”), ' +
        'then press Sync again.',
    'no-permission':
        'Allow access to archiveofourown.org when the browser asks. ' +
        'In Firefox you can also grant it from the add-on’s ' +
        'Permissions tab.',
    http: 'AO3 may be busy or down. Try again in a few minutes.',
    network: 'Check your connection and try again.',
    unknown: '',
};

/** Progress, errors and notices about syncing and importing. */
export function renderSyncBanner(
    state: DashboardState,
    controller: DashboardController,
): HTMLElement | null {
    const { sync } = state;

    if (sync.running) {
        const progress = sync.progress;
        const width = (value: number | null): string =>
            `--value: ${((value ?? 0.3) * 100).toFixed(1)}%`;
        const fraction =
            progress?.lastPage && progress.page > 0
                ? Math.min(1, progress.page / progress.lastPage)
                : null;
        return el(
            'div',
            {
                className: 'banner banner--progress',
                attrs: { role: 'status', 'aria-live': 'polite' },
            },
            el(
                'div',
                { className: 'banner__text' },
                el('strong', {
                    text: progress?.message ?? 'Starting…',
                }),
                el('span', {
                    className: 'muted',
                    text:
                        `${formatNumber(progress?.worksSeen ?? 0)} ` +
                        'entries read so far. You can switch tabs, ' +
                        'but keep this one open.',
                }),
            ),
            el(
                'div',
                {
                    className: `progress${
                        fraction === null ? ' is-indeterminate' : ''
                    }`,
                    attrs: {
                        role: 'progressbar',
                        'aria-valuemin': 0,
                        'aria-valuemax': 100,
                        'aria-valuenow':
                            fraction === null
                                ? undefined
                                : Math.round(fraction * 100),
                    },
                },
                el('span', {
                    className: 'progress__bar',
                    attrs: {
                        style: width(fraction),
                    },
                }),
            ),
        );
    }

    if (sync.error) {
        const help = HELP[sync.error.code] ?? '';
        return el(
            'div',
            { className: 'banner banner--error', attrs: { role: 'alert' } },
            el('span', {
                className: 'banner__icon',
                text: '!',
                attrs: { 'aria-hidden': true },
            }),
            el(
                'div',
                { className: 'banner__text' },
                el('strong', { text: sync.error.message }),
                help ? el('span', { text: help }) : null,
            ),
            sync.error.code === 'logged-out'
                ? el('a', {
                      className: 'button',
                      text: 'Open AO3 login',
                      attrs: {
                          href: `${AO3_ORIGIN}/users/login`,
                          target: '_blank',
                          rel: 'noopener noreferrer',
                      },
                  })
                : null,
            el('button', {
                className: 'button button--ghost',
                text: 'Dismiss',
                attrs: { type: 'button' },
                on: { click: controller.dismissMessage },
            }),
        );
    }

    if (sync.notice) {
        return el(
            'div',
            { className: 'banner banner--ok', attrs: { role: 'status' } },
            el('span', {
                className: 'banner__icon',
                text: '✓',
                attrs: { 'aria-hidden': true },
            }),
            el(
                'div',
                { className: 'banner__text' },
                el('strong', { text: sync.notice }),
            ),
            el('button', {
                className: 'button button--ghost',
                text: 'Dismiss',
                attrs: { type: 'button' },
                on: { click: controller.dismissMessage },
            }),
        );
    }

    return null;
}
