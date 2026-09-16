import type { DashboardState } from '@/app';

/** The sticky filter row; kept alive across re-renders. */
export type FilterBar = {
    element: HTMLElement;
    update(state: DashboardState, matching: number, total: number): void;
};
