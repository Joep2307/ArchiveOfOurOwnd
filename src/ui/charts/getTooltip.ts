import { el } from '../el';
import type { Tooltip } from './Tooltip';

let shared: Tooltip | null = null;

/** The single floating tooltip used by every chart. */
export function getTooltip(): Tooltip {
    if (shared) {
        return shared;
    }
    const node = el('div', {
        className: 'tooltip',
        attrs: { role: 'tooltip', hidden: true },
    });
    document.body.append(node);

    shared = {
        show(title, lines, anchor) {
            node.replaceChildren(
                el('div', { className: 'tooltip__title', text: title }),
                ...lines.map((line) =>
                    el(
                        'div',
                        { className: 'tooltip__row' },
                        el('span', { text: line.label }),
                        el('strong', { text: line.value }),
                    ),
                ),
            );
            node.hidden = false;
            const box = anchor.getBoundingClientRect();
            const tip = node.getBoundingClientRect();
            const left = Math.min(
                Math.max(8, box.left + box.width / 2 - tip.width / 2),
                window.innerWidth - tip.width - 8,
            );
            const above = box.top - tip.height - 8;
            const top = above > 8 ? above : box.bottom + 8;
            node.style.transform =
                `translate(${Math.round(left)}px, ` + `${Math.round(top)}px)`;
        },
        hide() {
            node.hidden = true;
        },
    };
    return shared;
}
