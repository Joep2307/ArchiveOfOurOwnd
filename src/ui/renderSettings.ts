import type { DashboardController, DashboardState } from '@/app';
import { formatNumber } from '@/format';
import {
    MAX_WORDS_PER_MINUTE,
    MIN_WORDS_PER_MINUTE,
    WORDS_PER_MINUTE,
} from '@/stats';
import { SPEED_TEST_PASSAGE } from './constants';
import { el } from './el';
import { renderPanel } from './renderPanel';

const PASSAGE_WORDS = SPEED_TEST_PASSAGE.join(' ')
    .split(/\s+/)
    .filter(Boolean).length;

function button(
    label: string,
    onClick: () => void,
    primary = false,
): HTMLButtonElement {
    return el('button', {
        className: `button${primary ? ' button--primary' : ''}`,
        text: label,
        attrs: { type: 'button' },
        on: { click: onClick },
    });
}

function renderSpeedField(
    state: DashboardState,
    controller: DashboardController,
): HTMLElement {
    const input = el('input', {
        className: 'input settings__number',
        attrs: {
            id: 'wpm-input',
            type: 'number',
            inputmode: 'numeric',
            min: MIN_WORDS_PER_MINUTE,
            max: MAX_WORDS_PER_MINUTE,
            step: 5,
            value: state.wordsPerMinute,
            required: true,
        },
    });
    const isDefault = state.wordsPerMinute === WORDS_PER_MINUTE;

    return renderPanel(
        {
            title: 'Reading speed',
            subtitle: 'Used for the estimated reading time on the dashboard.',
        },
        el(
            'form',
            {
                className: 'settings__row',
                on: {
                    submit: (event) => {
                        event.preventDefault();
                        void controller.setWordsPerMinute(input.valueAsNumber);
                    },
                },
            },
            el('label', {
                className: 'settings__label',
                text: 'Words per minute',
                attrs: { for: 'wpm-input' },
            }),
            input,
            el('button', {
                className: 'button button--primary',
                text: 'Save',
                attrs: { type: 'submit' },
            }),
            isDefault
                ? null
                : button(`Reset to ${WORDS_PER_MINUTE}`, () => {
                      void controller.setWordsPerMinute(WORDS_PER_MINUTE);
                  }),
        ),
        el('p', {
            className: 'settings__hint muted',
            text:
                `Now using ${formatNumber(state.wordsPerMinute)} words ` +
                `a minute${isDefault ? ' (the average)' : ''}. Most ` +
                'adults read 200–300 words a minute. Not sure? Take ' +
                'the test below.',
        }),
    );
}

function renderSpeedTest(
    state: DashboardState,
    controller: DashboardController,
): HTMLElement {
    const { startedAt, result, tooFast } = state.speedTest;
    const reading = startedAt !== null;

    let body: (Node | null)[];
    if (reading) {
        body = [
            el(
                'div',
                {
                    className: 'settings__passage',
                    attrs: { 'aria-live': 'polite' },
                },
                ...SPEED_TEST_PASSAGE.map((text) => el('p', { text })),
            ),
            el(
                'div',
                { className: 'settings__row' },
                button(
                    'I’m done reading',
                    () => {
                        controller.finishSpeedTest(PASSAGE_WORDS);
                    },
                    true,
                ),
                button('Cancel', controller.resetSpeedTest),
            ),
        ];
    } else if (result !== null) {
        body = [
            el(
                'p',
                { className: 'settings__result' },
                'You read about ',
                el('strong', { text: formatNumber(result) }),
                ' words a minute.',
            ),
            el(
                'div',
                { className: 'settings__row' },
                result === state.wordsPerMinute
                    ? el('span', {
                          className: 'muted',
                          text: 'This is your saved speed.',
                      })
                    : button(
                          `Use ${formatNumber(result)} words a minute`,
                          () => {
                              void controller.setWordsPerMinute(result);
                          },
                          true,
                      ),
                button('Try again', controller.startSpeedTest),
            ),
        ];
    } else {
        body = [
            el('p', {
                className: 'settings__hint',
                text: tooFast
                    ? 'That was very quick. Read the whole text at your ' +
                      'usual pace, then try again.'
                    : `Press start and read a short passage ` +
                      `(${PASSAGE_WORDS} words) the way you would read ` +
                      'a fic. Press done when you reach the end.',
            }),
            el(
                'div',
                { className: 'settings__row' },
                button(
                    tooFast ? 'Try again' : 'Start test',
                    controller.startSpeedTest,
                    true,
                ),
            ),
        ];
    }

    return renderPanel(
        {
            title: 'Reading speed test',
            subtitle: 'About one minute. Nothing is sent anywhere.',
        },
        ...body,
    );
}

/** The Advanced page: personal settings. */
export function renderSettings(
    state: DashboardState,
    controller: DashboardController,
): HTMLElement {
    return el(
        'section',
        {
            className: 'section settings',
            attrs: { id: 'settings', 'aria-labelledby': 'settings-h' },
        },
        el('h2', {
            className: 'section__title',
            text: 'Advanced settings',
            attrs: { id: 'settings-h' },
        }),
        el('p', {
            className: 'section__lead',
            text: 'Make the estimates fit the way you read.',
        }),
        el(
            'div',
            { className: 'settings__panels' },
            renderSpeedField(state, controller),
            renderSpeedTest(state, controller),
        ),
    );
}
