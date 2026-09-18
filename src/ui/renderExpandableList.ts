import type { DashboardController, DashboardState } from '@/app';
import { el } from './el';

/** Keep each ranking compact until the reader asks for more. */
export function renderExpandableList<T>(
    entries: readonly T[],
    limit: number,
    id: string,
    state: DashboardState,
    controller: DashboardController,
    render: (shown: readonly T[]) => HTMLElement,
): HTMLElement {
    const open = state.expanded[id] === true;
    return el(
        'div',
        {},
        render(open ? entries : entries.slice(0, limit)),
        entries.length > limit
            ? el('button', {
                  className: 'link-button',
                  text: open ? 'Show fewer' : 'Show more',
                  attrs: {
                      type: 'button',
                      'aria-expanded': String(open),
                  },
                  on: {
                      click: () => {
                          controller.toggleExpanded(id);
                      },
                  },
              })
            : null,
    );
}
