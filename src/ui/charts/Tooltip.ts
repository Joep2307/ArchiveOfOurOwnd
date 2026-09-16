export type TooltipLine = { label: string; value: string };

export type Tooltip = {
    show(title: string, lines: TooltipLine[], anchor: Element): void;
    hide(): void;
};
