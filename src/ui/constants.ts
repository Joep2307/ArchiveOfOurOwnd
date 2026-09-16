import type { DashboardView } from '@/app';

/** Menu label and icon for every page. */
export const VIEW_LINKS: Record<
    DashboardView,
    { label: string; icon: string }
> = {
    dashboard: { label: 'Dashboard', icon: '◈' },
    genres: { label: 'Genres', icon: '◐' },
    time: { label: 'Over time', icon: '◷' },
    shape: { label: 'Length & status', icon: '▥' },
    favourites: { label: 'Favourites', icon: '♡' },
    standouts: { label: 'Standouts', icon: '✦' },
    works: { label: 'All works', icon: '▤' },
    settings: { label: 'Advanced', icon: '⚙' },
};

/** Rows per list before "Show all". */
export const TOP_LIST_COLLAPSED = 10;
export const TOP_LIST_EXPANDED = 100;

/** Rows per list on the dashboard. */
export const HIGHLIGHT_ROWS = 5;

/** Text for the reading speed test, one entry per paragraph. */
export const SPEED_TEST_PASSAGE = [
    'The library at the end of Harrow Lane only opened after dark. ' +
        'Nobody in town could say who had first noticed this, but ' +
        'everyone agreed it had always been so, the way everyone ' +
        'agreed that the river ran cold even in August.',
    'Mira found it on a Tuesday, when the rain had chased her off the ' +
        'main road. The door was heavy and green, and a small brass ' +
        'bell rang when she pushed it open. Inside, the air smelled of ' +
        'dust and oranges. Lamps with yellow shades glowed over long ' +
        'tables, and the shelves climbed so high that she could not ' +
        'see where they ended.',
    'A woman in a grey cardigan looked up from the desk. "You are ' +
        'late," she said, as if they had arranged to meet. "Your book ' +
        'has been waiting."',
    'Mira laughed, unsure whether it was a joke. "I think you have me ' +
        'confused with someone else."',
    '"Perhaps," said the librarian, and slid a thin blue volume ' +
        'across the desk. There was no title on the cover, only a ' +
        'small silver star. When Mira opened it, the first line read: ' +
        'The library at the end of Harrow Lane only opened after dark.',
    'She closed the book quickly. The librarian had gone back to her ' +
        'work, humming something soft and old. Outside, the rain kept ' +
        'falling. Mira looked at the star for a long moment, then ' +
        'pulled out a chair, sat down under the nearest lamp, and ' +
        'began to read.',
];
