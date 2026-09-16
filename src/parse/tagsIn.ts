import { textOf } from './textOf';

/** Texts of all `a.tag` links matching `selector` under `root`. */
export function tagsIn(root: Element, selector: string): string[] {
    return Array.from(root.querySelectorAll(`${selector} a.tag`))
        .map((link) => textOf(link))
        .filter((text) => text.length > 0);
}
