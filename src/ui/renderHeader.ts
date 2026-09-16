import type { DashboardController, DashboardState } from '@/app';
import { formatRelativeTime } from '@/format';
import { el } from './el';

function menuItem(
    label: string,
    onClick: () => void,
    options: { danger?: boolean; disabled?: boolean } = {},
): HTMLElement {
    return el(
        'li',
        {},
        el('button', {
            className: `menu__item${options.danger ? ' is-danger' : ''}`,
            text: label,
            attrs: {
                type: 'button',
                role: 'menuitem',
                disabled: options.disabled,
            },
            on: {
                click: (event) => {
                    (event.currentTarget as HTMLElement)
                        .closest('details')
                        ?.removeAttribute('open');
                    onClick();
                },
            },
        }),
    );
}

/** Title bar with account, sync button and the options menu. */
export function renderHeader(
    state: DashboardState,
    controller: DashboardController,
    now: Date,
): HTMLElement {
    const { library, sync, demo, standalone } = state;
    const hasData = Boolean(library);

    const fileInput = el('input', {
        className: 'visually-hidden',
        attrs: {
            type: 'file',
            accept: 'application/json,.json',
            tabindex: -1,
            'aria-hidden': true,
        },
        on: {
            change: () => {
                const file = fileInput.files?.[0];
                if (file) {
                    void file
                        .text()
                        .then((text) => controller.importJson(text));
                }
            },
        },
    });

    const account = library
        ? el(
              'p',
              { className: 'header__account' },
              el('strong', { text: library.username }),
              demo
                  ? el('span', { className: 'badge', text: 'Demo data' })
                  : library.syncedAt
                    ? el('span', {
                          className: 'muted',
                          text: `synced ${formatRelativeTime(
                              library.syncedAt,
                              now,
                          )}`,
                      })
                    : el('span', {
                          className: 'muted',
                          text: 'sync not finished',
                      }),
          )
        : null;

    const themeLabel = {
        system: 'Theme: match system',
        light: 'Theme: light',
        dark: 'Theme: dark',
    }[state.theme];
    const nextTheme = (
        {
            system: 'light',
            light: 'dark',
            dark: 'system',
        } as const
    )[state.theme];

    const menu = el(
        'details',
        { className: 'menu' },
        el('summary', {
            className: 'button button--ghost',
            text: 'Options',
            attrs: { 'aria-haspopup': 'menu' },
        }),
        el(
            'ul',
            { className: 'menu__list', attrs: { role: 'menu' } },
            menuItem('Full re-sync', () => void controller.sync(true), {
                disabled: sync.running || standalone,
            }),
            menuItem('Export JSON (backup)', controller.exportJson, {
                disabled: !hasData,
            }),
            menuItem('Export CSV (filtered works)', controller.exportCsv, {
                disabled: !hasData,
            }),
            menuItem('Import JSON…', () => {
                fileInput.click();
            }),
            demo
                ? menuItem('Leave demo', controller.hideDemo)
                : menuItem('Preview with demo data', controller.showDemo, {
                      disabled: sync.running,
                  }),
            menuItem(themeLabel, () => {
                controller.setTheme(nextTheme);
            }),
            menuItem(
                `Highlight read works on AO3: ${
                    state.highlightOnAo3 ? 'on' : 'off'
                }`,
                () => void controller.setHighlightOnAo3(!state.highlightOnAo3),
                { disabled: standalone },
            ),
            menuItem(
                'Delete stored history…',
                () => void controller.clearData(),
                { danger: true, disabled: demo || !hasData || sync.running },
            ),
        ),
    );

    const syncButton = sync.running
        ? el('button', {
              className: 'button',
              text: 'Stop',
              attrs: { type: 'button' },
              on: { click: controller.stopSync },
          })
        : el('button', {
              className: 'button button--primary',
              text: library && !demo ? 'Sync now' : 'Sync my history',
              attrs: { type: 'button', disabled: standalone },
              on: { click: () => void controller.sync(false) },
          });

    return el(
        'header',
        { className: 'header' },
        el(
            'div',
            { className: 'header__inner' },
            el(
                'div',
                { className: 'header__brand' },
                el('span', {
                    className: 'header__mark',
                    attrs: { 'aria-hidden': true },
                }),
                el(
                    'div',
                    {},
                    el('h1', {
                        className: 'header__title',
                        text: 'Reading Stats',
                    }),
                    el('p', {
                        className: 'header__tagline',
                        text: 'for your AO3 history · unofficial',
                    }),
                ),
            ),
            el(
                'div',
                { className: 'header__actions' },
                account,
                syncButton,
                menu,
            ),
            fileInput,
        ),
    );
}
