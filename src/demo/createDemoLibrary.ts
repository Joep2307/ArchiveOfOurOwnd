import type { Library, Rating, Work, WorkFeedback } from '@/model';
import { RATINGS } from '@/model';
import { toIsoDate } from '@/parse';
import {
    DEMO_AUTHORS,
    DEMO_FANDOMS,
    DEMO_TAGS,
    DEMO_TITLE_WORDS,
    DEMO_USERNAME,
} from './constants';
import { createRandom } from './createRandom';

const CATEGORY_POOL = ['M/M', 'F/M', 'F/F', 'Gen', 'Multi', 'Other'];
const RATING_WEIGHTS = [0.3, 0.35, 0.18, 0.12, 0.05];

/**
 * Builds a believable, fictional history for previewing the
 * dashboard without an AO3 account.
 */
export function createDemoLibrary(
    count = 640,
    today = new Date(2026, 8, 16),
    seed = 7,
): Library {
    const random = createRandom(seed);
    const pick = <T>(items: readonly T[]): T => {
        const item = items[Math.floor(random() * items.length)];
        if (item === undefined) {
            throw new Error('empty pool');
        }
        return item;
    };
    const skewed = <T>(items: readonly T[]): T =>
        items[Math.floor(random() ** 2 * items.length)] ?? pick(items);
    const some = <T>(items: readonly T[], max: number): T[] => {
        const n = 1 + Math.floor(random() * max);
        return [...new Set(Array.from({ length: n }, () => pick(items)))];
    };
    const weighted = (): Rating => {
        let roll = random();
        for (const [index, weight] of RATING_WEIGHTS.entries()) {
            roll -= weight;
            if (roll <= 0) {
                return RATINGS[index] ?? 'Not Rated';
            }
        }
        return 'Not Rated';
    };

    const fandomNames = Object.keys(DEMO_FANDOMS);
    const works: Work[] = [];
    for (let i = 0; i < count; i += 1) {
        const daysAgo = Math.floor(random() ** 1.6 * 1400);
        const visited = new Date(today);
        visited.setDate(visited.getDate() - daysAgo);
        const updated = new Date(visited);
        updated.setDate(updated.getDate() - Math.floor(random() * 2500));

        const fandom = skewed(fandomNames);
        const cast = DEMO_FANDOMS[fandom] ?? [];
        const characters = some(cast, 3);
        const [first, second] = characters;
        const kind =
            random() < 0.02 ? 'deleted' : random() < 0.01 ? 'mystery' : 'work';
        const complete = random() < 0.72;
        const chaptersPosted =
            random() < 0.55 ? 1 : 2 + Math.floor(random() * 40);
        const words =
            Math.round(Math.exp(6.5 + random() * 5.5) / 10) * 10 +
            chaptersPosted * 800;
        const author = skewed(DEMO_AUTHORS);

        works.push({
            key: kind === 'deleted' ? `deleted-demo-${i}` : `work-${i + 1}`,
            kind,
            id: kind === 'deleted' ? null : i + 1,
            title:
                kind === 'work'
                    ? `${pick(DEMO_TITLE_WORDS)} and ` + pick(DEMO_TITLE_WORDS)
                    : kind === 'deleted'
                      ? 'Deleted work'
                      : 'Mystery work',
            authors: kind === 'work' ? [{ user: author, pseud: author }] : [],
            anonymous: kind === 'work' && random() < 0.03,
            fandoms: kind === 'work' ? [fandom] : [],
            rating: kind === 'work' ? weighted() : 'Not Rated',
            categories: kind === 'work' ? [skewed(CATEGORY_POOL)] : [],
            warnings: kind === 'work' ? ['No Archive Warnings Apply'] : [],
            relationships:
                kind === 'work' && first && second && random() < 0.7
                    ? [`${first}/${second}`]
                    : [],
            characters: kind === 'work' ? characters : [],
            freeforms: kind === 'work' ? some(DEMO_TAGS, 5) : [],
            language: kind === 'work' ? 'English' : '',
            words: kind === 'work' ? words : 0,
            chaptersPosted: kind === 'work' ? chaptersPosted : 0,
            chaptersTotal: complete ? chaptersPosted : null,
            complete: kind === 'work' && complete,
            kudos: kind === 'work' ? Math.floor(random() ** 3 * 4000) : 0,
            comments: Math.floor(random() ** 3 * 300),
            bookmarks: Math.floor(random() ** 3 * 600),
            hits: Math.floor(random() ** 2 * 90_000),
            series:
                kind === 'work' && random() < 0.15
                    ? [
                          {
                              id: 1 + Math.floor(random() * 30),
                              title: `${pick(DEMO_TITLE_WORDS)} Cycle`,
                              part: 1 + Math.floor(random() * 5),
                          },
                      ]
                    : [],
            summary: '',
            updated: kind === 'work' ? toIsoDate(updated) : null,
            lastVisited: toIsoDate(visited),
            visits: 1 + Math.floor(random() ** 4 * 30),
            updateAvailable: !complete && random() < 0.3,
            markedForLater: random() < 0.04,
        });
    }
    works.sort((a, b) =>
        (b.lastVisited ?? '').localeCompare(a.lastVisited ?? ''),
    );
    // Drawn after the works, so the works stay the same per seed.
    const feedback: Record<string, WorkFeedback> = {};
    for (const work of works) {
        if (work.kind === 'work' && random() < 0.85) {
            feedback[work.key] = {
                kudos: random() < 0.35,
                commented: random() < 0.08,
                checkedAt: today.toISOString(),
            };
        }
    }
    return {
        version: 1,
        username: DEMO_USERNAME,
        syncedAt: today.toISOString(),
        works,
        feedback,
    };
}
