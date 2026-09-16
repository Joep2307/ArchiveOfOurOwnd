import { BADGE_CLASS, READ_CLASS, READ_LINK_CLASS } from './constants';

/** Removes every highlight and badge this extension added. */
export function clearMarks(doc: Document): void {
    for (const cls of [READ_CLASS, READ_LINK_CLASS]) {
        for (const node of doc.querySelectorAll(`.${cls}`)) {
            node.classList.remove(cls);
        }
    }
    for (const badge of doc.querySelectorAll(`.${BADGE_CLASS}`)) {
        badge.remove();
    }
}
