import type { Store } from './Store';

/** Minimal observable state container. */
export function createStore<T extends object>(initial: T): Store<T> {
    let state = initial;
    const listeners = new Set<(state: T, previous: T) => void>();
    return {
        get: () => state,
        update(change) {
            const previous = state;
            const patch =
                typeof change === 'function' ? change(state) : change;
            state = { ...state, ...patch };
            listeners.forEach((listener) => {
                listener(state, previous);
            });
        },
        subscribe(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
    };
}
