import type { Work, WorkFeedback } from '@/model';
import { parseHtml } from '@/parse';
import type { FetchText } from '@/sync';
import { SyncError } from '@/sync';
import { countFeedback } from './countFeedback';
import { feedbackCandidates } from './feedbackCandidates';
import { runFeedbackScan } from './runFeedbackScan';

const NOW = new Date('2026-09-16T12:00:00Z');
const ME = 'me';

function work(id: number, change: Partial<Work> = {}): Work {
    return {
        key: `work-${id}`,
        kind: 'work',
        id,
        title: `Work ${id}`,
        authors: [],
        anonymous: false,
        fandoms: [],
        rating: 'Not Rated',
        categories: [],
        warnings: [],
        relationships: [],
        characters: [],
        freeforms: [],
        language: 'English',
        words: 1000,
        chaptersPosted: 1,
        chaptersTotal: 1,
        complete: true,
        kudos: 10,
        comments: 5,
        bookmarks: 0,
        hits: 0,
        series: [],
        summary: '',
        updated: null,
        lastVisited: '2026-09-01',
        visits: 1,
        updateAvailable: false,
        markedForLater: false,
        ...change,
    };
}

const GREETING = `<p id="greeting"><a href="/users/${ME}">Hi</a></p>`;

function kudosPage(users: string[], lastPage: number): string {
    const links = Array.from(
        { length: lastPage },
        (_, i) => `<a href="/works/1/kudos?page=${i + 1}">${i + 1}</a>`,
    ).join('');
    const names = users
        .map((user) => `<a href="/users/${user}">${user}</a>`)
        .join(', ');
    return `${GREETING}<ol class="pagination">${links}</ol>
        <div id="kudos"><p class="kudos">${names}</p></div>`;
}

function commentHtml(users: string[], cut: number[] = []): string {
    return (
        '<ol class="thread">' +
        users
            .map(
                (user) =>
                    `<li class="comment"><h4 class="heading byline">` +
                    `<a href="/users/${user}/pseuds/${user}">${user}</a>` +
                    '</h4></li>',
            )
            .join('') +
        cut
            .map(
                (id) =>
                    `<li class="comment"><p>(<a href="/comments/${id}">` +
                    'more</a>)</p></li>',
            )
            .join('') +
        '</ol>'
    );
}

function commentsScript(html: string): string {
    const escaped = html.replace(/"/g, '\\"').replace(/\//g, '\\/');
    return `$j("#comments_placeholder").html("${escaped}");`;
}

type Site = Record<string, string | number>;

function fakeAo3(site: Site): {
    fetchText: FetchText;
    requested: string[];
    headers: (Readonly<Record<string, string>> | undefined)[];
} {
    const requested: string[] = [];
    const headers: (Readonly<Record<string, string>> | undefined)[] = [];
    const fetchText: FetchText = (url, _signal, sent) => {
        const path = url.replace('https://archiveofourown.org', '');
        requested.push(path);
        headers.push(sent);
        const page = site[path.replace(/[?&]view_adult=true/, '')];
        return Promise.resolve({
            status: typeof page === 'number' ? page : page ? 200 : 404,
            url,
            retryAfter: null,
            text: typeof page === 'string' ? page : '',
        });
    };
    return { fetchText, requested, headers };
}

function scan(
    site: Site,
    works: Work[],
    feedback: Record<string, WorkFeedback> = {},
) {
    const fake = fakeAo3(site);
    const saved: Record<string, WorkFeedback>[] = [];
    const sleeps: number[] = [];
    const run = runFeedbackScan({
        username: ME,
        works,
        feedback,
        fetchText: fake.fetchText,
        parseHtml,
        sleep: (ms) => {
            sleeps.push(ms);
            return Promise.resolve();
        },
        save: (result) => {
            saved.push(result);
            return Promise.resolve();
        },
        delayMs: 5,
        now: () => NOW,
    });
    return { run, saved, sleeps, ...fake };
}

describe('runFeedbackScan', () => {
    it('stops reading kudos pages once the reader shows up', async () => {
        const { run, requested } = scan(
            {
                '/works/1/kudos?page=1': kudosPage(['a', 'b'], 3),
                '/works/1/kudos?page=2': kudosPage(['c', 'me'], 3),
                '/comments/show_comments?work_id=1&page=1': commentsScript(
                    commentHtml(['a']),
                ),
            },
            [work(1)],
        );
        expect(await run).toEqual({
            'work-1': {
                kudos: true,
                commented: false,
                checkedAt: NOW.toISOString(),
            },
        });
        expect(requested).toEqual([
            '/works/1/kudos?page=1&view_adult=true',
            '/works/1/kudos?page=2&view_adult=true',
            '/comments/show_comments?work_id=1&page=1&view_adult=true',
        ]);
    });

    it('asks for the comments script and follows cut threads', async () => {
        const { run, headers, sleeps } = scan(
            {
                '/comments/show_comments?work_id=2&page=1': commentsScript(
                    commentHtml(['a'], [50]),
                ),
                '/comments/50': GREETING + commentHtml(['b'], [60]),
                '/comments/60': GREETING + commentHtml(['me']),
            },
            [work(2, { kudos: 0 })],
        );
        expect((await run)['work-2']).toMatchObject({
            kudos: false,
            commented: true,
        });
        expect(headers[0]).toMatchObject({
            'X-Requested-With': 'XMLHttpRequest',
        });
        expect(headers[1]).toBeUndefined();
        // A pause before every request but the first.
        expect(sleeps).toEqual([5, 5]);
    });

    it('skips requests it can answer without AO3', async () => {
        const { run, requested } = scan({}, [
            work(3, { kudos: 0, comments: 0 }),
            work(4, { kind: 'deleted', id: null }),
        ]);
        expect(await run).toEqual({
            'work-3': {
                kudos: false,
                commented: false,
                checkedAt: NOW.toISOString(),
            },
        });
        expect(requested).toEqual([]);
    });

    it('keeps earlier finds and does not ask again', async () => {
        const earlier = {
            'work-5': {
                kudos: true,
                commented: false,
                checkedAt: '2026-01-01T00:00:00Z',
            },
        };
        const { run, requested } = scan(
            {
                '/comments/show_comments?work_id=5&page=1': commentsScript(
                    commentHtml(['me']),
                ),
            },
            [work(5)],
            earlier,
        );
        expect((await run)['work-5']).toMatchObject({
            kudos: true,
            commented: true,
        });
        expect(requested).toHaveLength(1);
    });

    it('records unreadable works as unknown and goes on', async () => {
        const { run } = scan(
            {
                '/works/7/kudos?page=1': kudosPage(['me'], 1),
                '/comments/show_comments?work_id=7&page=1': commentsScript(
                    commentHtml([]),
                ),
            },
            [work(6), work(7)],
        );
        const result = await run;
        expect(result['work-6']).toMatchObject({
            kudos: null,
            commented: null,
        });
        expect(result['work-7']).toMatchObject({
            kudos: true,
            commented: false,
        });
    });

    it('stops when AO3 shows someone else is logged in', async () => {
        const { run } = scan(
            {
                '/works/1/kudos?page=1': kudosPage(['me'], 1).replace(
                    '/users/me">Hi',
                    '/users/other">Hi',
                ),
            },
            [work(1)],
        );
        await expect(run).rejects.toMatchObject({
            code: 'logged-out',
        } satisfies Partial<SyncError>);
    });

    it('saves along the way', async () => {
        const works = Array.from({ length: 12 }, (_, i) =>
            work(i + 1, { kudos: 0, comments: 0 }),
        );
        const { run, saved } = scan({}, works);
        await run;
        expect(saved.map((entry) => Object.keys(entry).length)).toEqual([
            10, 12,
        ]);
    });
});

describe('feedbackCandidates', () => {
    const checked = (
        kudos: boolean | null,
        commented: boolean | null,
    ): WorkFeedback => ({
        kudos,
        commented,
        checkedAt: new Date(2026, 8, 10, 8).toISOString(),
    });

    it('picks new, unknown and revisited works', () => {
        const works = [
            work(1),
            work(2),
            work(3),
            work(4, { lastVisited: '2026-09-10' }),
            work(5, { lastVisited: '2026-09-12' }),
            work(6, { kind: 'mystery' }),
        ];
        const feedback = {
            'work-2': checked(false, false),
            'work-3': checked(null, false),
            'work-4': checked(true, false),
            'work-5': checked(true, true),
        };
        expect(feedbackCandidates(works, feedback).map((w) => w.id)).toEqual([
            1, 3, 4,
        ]);
    });
});

describe('countFeedback', () => {
    it('counts only readable works', () => {
        const works = [
            work(1),
            work(2),
            work(3),
            work(4, { kind: 'deleted', id: null }),
        ];
        expect(
            countFeedback(works, {
                'work-1': {
                    kudos: true,
                    commented: true,
                    checkedAt: '',
                },
                'work-2': {
                    kudos: false,
                    commented: null,
                    checkedAt: '',
                },
                'work-4': {
                    kudos: true,
                    commented: true,
                    checkedAt: '',
                },
            }),
        ).toEqual({ checked: 2, kudos: 1, commented: 1, unchecked: 1 });
    });
});
