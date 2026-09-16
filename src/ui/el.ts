type Child = Node | string | number | null | undefined | false;

export type ElProps = {
    className?: string;
    text?: string;
    attrs?: Record<string, string | number | boolean | undefined>;
    on?: Partial<{
        [K in keyof HTMLElementEventMap]: (
            event: HTMLElementEventMap[K],
        ) => void;
    }>;
};

/**
 * Creates an element. Children that are `null`, `undefined` or
 * `false` are skipped, which keeps conditional markup short.
 */
export function el<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    props: ElProps = {},
    ...children: Child[]
): HTMLElementTagNameMap[K] {
    const node = document.createElement(tag);
    if (props.className) {
        node.className = props.className;
    }
    if (props.text !== undefined) {
        node.textContent = props.text;
    }
    for (const [name, value] of Object.entries(props.attrs ?? {})) {
        if (value === undefined || value === false) {
            continue;
        }
        node.setAttribute(name, value === true ? '' : String(value));
    }
    for (const [type, listener] of Object.entries(props.on ?? {})) {
        node.addEventListener(type, listener as EventListener);
    }
    for (const child of children) {
        if (child === null || child === undefined || child === false) {
            continue;
        }
        node.append(typeof child === 'object' ? child : String(child));
    }
    return node;
}
