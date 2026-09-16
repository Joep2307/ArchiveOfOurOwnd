import type { DashboardController, DashboardState } from '@/app';
import { el } from './el';

/** First-run screen when nothing is stored yet. */
export function renderWelcome(
    state: DashboardState,
    controller: DashboardController,
): HTMLElement {
    const steps = [
        'Make sure you are logged in to archiveofourown.org in this ' +
            'browser and that History is turned on in your AO3 ' +
            'preferences.',
        'Press “Sync my history”. The extension reads your History ' +
            'pages one by one, with a pause between pages so AO3 is ' +
            'not overloaded. Large histories take a few minutes.',
        'Explore. Everything is stored only in this browser. Next ' +
            'time, a sync only reads what changed.',
    ];
    return el(
        'section',
        { className: 'welcome' },
        el('h2', {
            className: 'welcome__title',
            text: 'See everything you have read on AO3',
        }),
        el('p', {
            className: 'welcome__lead',
            text:
                'Works, words, authors, fandoms, ships and tags, with ' +
                'averages, trends and top lists.',
        }),
        el(
            'ol',
            { className: 'welcome__steps' },
            ...steps.map((step) => el('li', { text: step })),
        ),
        state.standalone
            ? el('p', {
                  className: 'banner banner--info',
                  text:
                      'This is the local preview. Syncing only works ' +
                      'when the page runs inside the installed ' +
                      'extension.',
              })
            : null,
        el(
            'div',
            { className: 'welcome__actions' },
            el('button', {
                className: 'button button--primary button--large',
                text: 'Sync my history',
                attrs: {
                    type: 'button',
                    disabled: state.standalone || state.sync.running,
                },
                on: { click: () => void controller.sync(false) },
            }),
            el('button', {
                className: 'button button--large',
                text: 'Preview with demo data',
                attrs: { type: 'button', disabled: state.sync.running },
                on: { click: controller.showDemo },
            }),
        ),
    );
}
