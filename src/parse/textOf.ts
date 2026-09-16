/** Trimmed text content with runs of whitespace collapsed. */
export function textOf(node: Node | null | undefined): string {
    return (node?.textContent ?? '').replace(/\s+/g, ' ').trim();
}
