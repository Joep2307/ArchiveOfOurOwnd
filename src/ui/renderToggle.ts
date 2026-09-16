import { el } from './el';

export type ToggleOption = { id: string; label: string };

/** A small segmented control. */
export function renderToggle(
    label: string,
    options: readonly ToggleOption[],
    selected: string,
    onChange: (id: string) => void,
): HTMLElement {
    return el(
        'div',
        {
            className: 'toggle',
            attrs: { role: 'group', 'aria-label': label },
        },
        ...options.map((option) =>
            el('button', {
                className: `toggle__option${
                    option.id === selected ? ' is-active' : ''
                }`,
                text: option.label,
                attrs: {
                    type: 'button',
                    'aria-pressed': option.id === selected ? 'true' : 'false',
                },
                on: {
                    click: () => {
                        onChange(option.id);
                    },
                },
            }),
        ),
    );
}
