export type Store<T> = {
    get(): T;
    update(change: Partial<T> | ((state: T) => Partial<T>)): void;
    subscribe(listener: (state: T, previous: T) => void): () => void;
};
