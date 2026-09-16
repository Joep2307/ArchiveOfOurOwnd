import { getTooltip } from './getTooltip';
import type { TooltipLine } from './Tooltip';

/** Shows the shared tooltip on hover and keyboard focus. */
export function withTooltip<T extends HTMLElement>(
    node: T,
    title: string,
    lines: TooltipLine[],
): T {
    const show = (): void => {
        getTooltip().show(title, lines, node);
    };
    const hide = (): void => {
        getTooltip().hide();
    };
    node.addEventListener('pointerenter', show);
    node.addEventListener('pointerleave', hide);
    node.addEventListener('focus', show);
    node.addEventListener('blur', hide);
    return node;
}
