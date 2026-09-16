import type { Rating } from '@/model';

const BY_CLASS: readonly (readonly [string, Rating])[] = [
    ['rating-general-audience', 'General Audiences'],
    ['rating-teen', 'Teen And Up Audiences'],
    ['rating-mature', 'Mature'],
    ['rating-explicit', 'Explicit'],
];

/** Reads the rating from the symbols block of a blurb. */
export function parseRating(root: Element): Rating {
    const span = root.querySelector('.required-tags span.rating');
    if (!span) {
        return 'Not Rated';
    }
    for (const [className, rating] of BY_CLASS) {
        if (span.classList.contains(className)) {
            return rating;
        }
    }
    const title = span.getAttribute('title') ?? '';
    const match = BY_CLASS.find(([, rating]) => rating === title);
    return match ? match[1] : 'Not Rated';
}
