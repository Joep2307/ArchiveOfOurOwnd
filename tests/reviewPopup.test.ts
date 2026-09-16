import { readFileSync } from 'node:fs';
import {
    createDashboardController,
    createInitialState,
    createStore,
} from '@/app';
import { createDemoLibrary } from '@/demo';
import { createMemoryStorage } from '@/storage';
import { parseHtml } from '@/parse';
import { loadCore } from './loadCore';
import { reviewCandidates } from '@/stats/reviewCandidates';

const html = readFileSync('tests/fixtures/readings-page.html', 'utf8');

function setup(fail = false) {
    const store = createStore(createInitialState(false));
    const controller = createDashboardController(store, {
        storage: createMemoryStorage(),
        core: loadCore(),
        fetchText: (url) =>
            fail
                ? Promise.reject(new Error('Offline'))
                : Promise.resolve({
                      status: 200,
                      url,
                      retryAfter: null,
                      text: html,
                  }),
        parseHtml,
        sleep: () => Promise.resolve(),
        delayMs: 0,
        requestAccess: () => Promise.resolve(true),
        download: () => undefined,
        confirm: () => true,
        now: () => new Date('2026-09-16'),
        createDemo: () => createDemoLibrary(10),
    });
    return { store, controller };
}

describe('review popup after sync', () => {
    it('opens on success, closes, and can be reopened', async () => {
        const { store, controller } = setup();
        await controller.load();
        expect(store.get().reviewOpen).toBe(false);
        await controller.sync(false);
        expect(store.get().sync.error).toBeNull();
        expect(store.get().reviewOpen).toBe(true);
        controller.setReviewOpen(false);
        expect(store.get().reviewOpen).toBe(false);
        controller.setReviewOpen(true);
        expect(store.get().reviewOpen).toBe(true);
    });

    it('does not open after a failed sync', async () => {
        const { store, controller } = setup(true);
        await controller.sync(false);
        expect(store.get().sync.error).not.toBeNull();
        expect(store.get().reviewOpen).toBe(false);
    });

    it('stays closed until a candidate is unreviewed', async () => {
        const { store, controller } = setup();
        await controller.sync(false);
        const candidates = reviewCandidates(store.get().library?.works ?? []);
        expect(candidates.length).toBeGreaterThan(0);
        for (const work of candidates) {
            await controller.reviewWork(work.key, 'finished', 1);
        }
        controller.setReviewOpen(false);
        await controller.sync(true);
        expect(store.get().reviewOpen).toBe(false);
        const first = candidates[0];
        if (!first) throw new Error('Missing candidate');
        await controller.reviewWork(first.key, null);
        await controller.sync(false);
        expect(store.get().reviewOpen).toBe(true);
    });
});
