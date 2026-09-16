import { el } from './el';

export type PanelOptions = {
    title: string;
    subtitle?: string;
    className?: string;
    actions?: Node | null;
};

/** A titled card. */
export function renderPanel(
    options: PanelOptions,
    ...content: (Node | null)[]
): HTMLElement {
    return el(
        'section',
        {
            className: `panel${
                options.className ? ` ${options.className}` : ''
            }`,
        },
        el(
            'header',
            { className: 'panel__header' },
            el(
                'div',
                {},
                el('h3', { className: 'panel__title', text: options.title }),
                options.subtitle
                    ? el('p', {
                          className: 'panel__subtitle',
                          text: options.subtitle,
                      })
                    : null,
            ),
            options.actions ?? null,
        ),
        ...content,
    );
}
