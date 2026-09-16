import { createDemoLibrary, DEMO_USERNAME } from '@/demo';
import type { Library } from '@/model';
import {
    createMemoryStorage,
    loadActiveLibrary,
    saveLibrary,
} from '@/storage';
import { SyncError, type FetchText, type Sleep } from '@/sync';
import { loadCore } from '../../tests/loadCore';
import { createDashboardController } from './createDashboardController';
import { createInitialState } from './createInitialState';
import { createStore } from './createStore';

const ME = `<a href="/users/${DEMO_USERNAME}">me</a>`;
const GREETING = `<p id="greeting">${ME}</p>`;

/** AO3 where the demo reader left kudos everywhere, comments nowhere. */
const fetchText: FetchText = (url) =>
    Promise.resolve({
        status: 200,
        url,
        retryAfter: null,
        text: url.includes('/kudos')
            ? `${GREETING}<div id="kudos">` +
              `<a href="/users/${DEMO_USERNAME}">me</a></div>`
            : '$j("#comments_placeholder").html("<ol><\\/ol>");',
    });

async function setup(options: { onFetch?: () => void; sleep?: Sleep } = {}) {
    const storage = createMemoryStorage();
    const library: Library = {
        ...createDemoLibrary(12),
        feedback: {},
    };
    await saveLibrary(storage, library);
    const store = createStore(createInitialState(false));
    let requests = 0;
    const controller = createDashboardController(store, {
        storage,
        core: loadCore(),
        fetchText: (url, signal, headers) => {
            requests += 1;
            options.onFetch?.();
            return fetchText(url, signal, headers);
        },
        sleep: options.sleep ?? (() => Promise.resolve()),
        parseHtml: (html) =>
            new DOMParser().parseFromString(html, 'text/html'),
        requestAccess: () => Promise.resolve(true),
        download: () => undefined,
        confirm: () => true,
        now: () => new Date(2026, 8, 16),
        createDemo: () => createDemoLibrary(12),
    });
    await controller.load();
    const readable = library.works.filter((work) => work.kind === 'work');
    return {
        storage,
        store,
        controller,
        readable,
        requests: () => requests,
    };
}

describe('checking kudos and comments', () => {
    it('saves what it found and skips it next time', async () => {
        const { storage, store, controller, readable, requests } =
            await setup();
        await controller.checkFeedback();

        const feedback = (await loadActiveLibrary(storage))?.feedback ?? {};
        expect(Object.keys(feedback)).toHaveLength(readable.length);
        for (const work of readable) {
            expect(feedback[work.key]).toMatchObject({
                kudos: work.kudos > 0,
                commented: false,
            });
        }
        expect(store.get().library?.feedback).toEqual(feedback);
        expect(store.get().sync).toMatchObject({
            running: false,
            error: null,
            notice: `Checked kudos and comments on ${readable.length} works.`,
        });

        // Only works opened on the day of the check are asked again,
        // and only for comments: kudos found stay found.
        const before = requests();
        await controller.checkFeedback();
        const today = readable.filter(
            (work) => work.lastVisited === '2026-09-16' && work.comments > 0,
        );
        expect(requests() - before).toBe(today.length);
    });

    it('keeps partial results when stopped', async () => {
        let calls = 0;
        const holder: { stop?: () => void } = {};
        const { storage, store, controller, readable } = await setup({
            onFetch: () => {
                calls += 1;
                if (calls === 3) {
                    holder.stop?.();
                }
            },
            sleep: (_ms, signal) =>
                signal?.aborted
                    ? Promise.reject(new SyncError('aborted', 'stopped'))
                    : Promise.resolve(),
        });
        holder.stop = controller.stopSync;
        await controller.checkFeedback();

        const feedback = (await loadActiveLibrary(storage))?.feedback ?? {};
        const found = Object.keys(feedback).length;
        expect(found).toBeGreaterThan(0);
        expect(found).toBeLessThan(readable.length);
        expect(store.get().sync.notice).toMatch(/^Check stopped/);
        expect(store.get().sync.running).toBe(false);
    });

    it('does nothing for demo data', async () => {
        const { controller, requests } = await setup();
        controller.showDemo();
        await controller.checkFeedback();
        expect(requests()).toBe(0);
    });
});
