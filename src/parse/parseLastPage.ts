/**
 * Highest page number linked from the pagination, or 1 when the
 * page has no pagination.
 */
export function parseLastPage(doc: Document): number {
    let last = 1;
    const links = doc.querySelectorAll(
        '.pagination a[href*="page="], .pagination .current',
    );
    for (const node of Array.from(links)) {
        const href = node.getAttribute('href');
        const value = href
            ? /[?&]page=(\d+)/.exec(href)?.[1]
            : node.textContent;
        const page = Number(value);
        if (Number.isFinite(page) && page > last) {
            last = page;
        }
    }
    return last;
}
