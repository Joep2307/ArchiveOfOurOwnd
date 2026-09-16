import type { Library, Work } from '@/model';
import { parseHtml } from '@/parse';
import type { FetchText } from './FetchText';
import { runSync } from './runSync';
import { SyncError } from './SyncError';
import { computeStats } from '@/stats';
import { loadCore } from '../../tests/loadCore';

const NOW = new Date(2026, 8, 16);

type Entry = { id: number; visited: string; visits: number };

function page(entries: Entry[], lastPage: number): string {
    const items = entries
        .map(
            (entry) => `
        <li id="work_${entry.id}" class="reading work blurb">
          <div class="header module"><h4 class="heading">
            <a href="/works/${entry.id}">Work ${entry.id}</a> by
            <a rel="author" href="/users/a/pseuds/a">a</a>
          </h4></div>
          <dl class="stats"><dd class="words">100</dd></dl>
          <div class="user module"><h4 class="viewed heading">
            <span>Last visited:</span> ${entry.visited}
            (Latest version.) Visited ${entry.visits} times
          </h4></div>
        </li>`,
        )
        .join('');
    const links = Array.from(
        { length: lastPage },
        (_, i) => `<a href="?page=${i + 1}">${i + 1}</a>`,
    ).join('');
    return `<nav id="greeting"><a href="/users/me">Hi</a></nav>
        <ol class="reading">${items}</ol>
        <ol class="pagination">${links}</ol>`;
}

function fakeAo3(pages: Entry[][]): {
    fetchText: FetchText;
    requested: string[];
} {
    const requested: string[] = [];
    const fetchText: FetchText = (url) => {
        requested.push(url);
        const match = /page=(\d+)/.exec(url);
        const index = match ? Number(match[1]) - 1 : -1;
        const html =
            index < 0
                ? '<nav id="greeting"><a href="/users/me">Hi</a></nav>'
                : page(pages[index] ?? [], pages.length);
        return Promise.resolve({
            status: 200,
            url,
            retryAfter: null,
            text: html,
        });
    };
    return { fetchText, requested };
}

function setup(pages: Entry[][], stored: Library | null) {
    const saved: Library[] = [];
    const fake = fakeAo3(pages);
    const options = {
        fetchText: fake.fetchText,
        parseHtml,
        sleep: () => Promise.resolve(),
        loadStored: () => Promise.resolve(stored),
        save: (library: Library) => {
            saved.push(library);
            return Promise.resolve();
        },
        now: () => NOW,
    };
    return { options, saved, requested: fake.requested };
}

const PAGES: Entry[][] = [
    [
        { id: 1, visited: '10 Sep 2026', visits: 2 },
        { id: 2, visited: '01 Sep 2026', visits: 1 },
    ],
    [
        { id: 3, visited: '01 Jan 2026', visits: 5 },
        { id: 4, visited: '01 Jan 2025', visits: 1 },
    ],
    [{ id: 5, visited: '01 Jan 2024', visits: 1 }],
];

describe('runSync', () => {
    it('reads every page on the first sync', async () => {
        const { options, saved, requested } = setup(PAGES, null);
        const library = await runSync(options);
        expect(requested).toHaveLength(4);
        expect(library.username).toBe('me');
        expect(library.works.map((w: Work) => w.id)).toEqual([1, 2, 3, 4, 5]);
        expect(library.syncedAt).toBe(NOW.toISOString());
        expect(saved.at(-1)).toEqual(library);
    });

    it('stops early when pages are unchanged', async () => {
        const first = await runSync(setup(PAGES, null).options);
        const changed: Entry[][] = [
            [
                { id: 4, visited: '15 Sep 2026', visits: 2 },
                { id: 1, visited: '10 Sep 2026', visits: 2 },
            ],
            [
                { id: 2, visited: '01 Sep 2026', visits: 1 },
                { id: 3, visited: '01 Jan 2026', visits: 5 },
            ],
            [{ id: 5, visited: '01 Jan 2024', visits: 1 }],
        ];
        const { options, requested } = setup(changed, first);
        const library = await runSync(options);
        // home + page 1 + page 2 (unchanged, stop)
        expect(requested).toHaveLength(3);
        expect(library.works.map((w: Work) => w.id)).toEqual([4, 1, 2, 3, 5]);
        expect(library.works[0]?.visits).toBe(2);
    });

    it('rereads everything on a full sync', async () => {
        const first = await runSync(setup(PAGES, null).options);
        const { options, requested } = setup(PAGES, first);
        await runSync({ ...options, full: true });
        expect(requested).toHaveLength(4);
    });

    it.each([false, true])(
        'restores later visits (full sync: %s)',
        async (full) => {
            const first = await runSync(setup(PAGES, null).options);
            const work = first.works[0];
            if (!work) throw new Error('Missing fixture work');
            first.reviews = {
                [work.key]: {
                    status: 'opened',
                    words: work.words,
                    reviewedAt: NOW.toISOString(),
                },
            };
            const core = loadCore();
            const before = computeStats(first.works, core, first.reviews);
            const unchanged = await runSync({
                ...setup(PAGES, first).options,
                full,
            });
            expect(unchanged.reviews?.[work.key]?.status).toBe('opened');
            const changed = PAGES.map((entries) =>
                entries.map((entry) =>
                    entry.id === work.id
                        ? { ...entry, visits: entry.visits + 1 }
                        : entry,
                ),
            );
            const after = await runSync({
                ...setup(changed, unchanged).options,
                full,
            });
            expect(after.reviews?.[work.key]).toBeUndefined();
            const stats = computeStats(after.works, core, after.reviews);
            expect(stats.totals.works).toBe(before.totals.works + 1);
            expect(stats.totals.words).toBe(before.totals.words + work.words);
            expect(stats.totals.confirmedWords).toBe(0);
        },
    );

    it('fails clearly when logged out', async () => {
        const { options } = setup(PAGES, null);
        const loggedOut: FetchText = (url) =>
            Promise.resolve({
                status: 200,
                url,
                retryAfter: null,
                text: '<p>Log in</p>',
            });
        await expect(
            runSync({ ...options, fetchText: loggedOut }),
        ).rejects.toMatchObject({ code: 'logged-out' });
    });

    it('waits and retries when rate limited', async () => {
        const { options } = setup(PAGES, null);
        let calls = 0;
        const waits: number[] = [];
        const flaky: FetchText = (url, signal) => {
            calls += 1;
            if (calls === 2) {
                return Promise.resolve({
                    status: 429,
                    url,
                    retryAfter: '7',
                    text: '',
                });
            }
            return options.fetchText(url, signal);
        };
        const library = await runSync({
            ...options,
            fetchText: flaky,
            sleep: (ms: number) => {
                waits.push(ms);
                return Promise.resolve();
            },
        });
        expect(waits).toContain(7000);
        expect(library.works).toHaveLength(5);
    });

    it('stops when aborted', async () => {
        const { options } = setup(PAGES, null);
        const controller = new AbortController();
        controller.abort();
        await expect(
            runSync({
                ...options,
                signal: controller.signal,
                sleep: () => Promise.reject(new SyncError('aborted', 'stop')),
            }),
        ).rejects.toMatchObject({ code: 'aborted' });
    });
});
