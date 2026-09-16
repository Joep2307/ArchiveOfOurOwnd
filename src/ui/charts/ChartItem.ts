import type { TooltipLine } from './Tooltip';

/** One bar or column. */
export type ChartItem = {
    id: string;
    label: string;
    /** Short label for the axis; defaults to `label`. */
    shortLabel?: string;
    value: number;
    /** Text shown at the end of the bar. */
    display: string;
    details: TooltipLine[];
    active: boolean;
};
