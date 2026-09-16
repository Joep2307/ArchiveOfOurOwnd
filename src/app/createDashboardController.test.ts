import { createDemoLibrary } from '@/demo';
import {
    createMemoryStorage,
    loadActiveLibrary,
    loadWordsPerMinute,
    saveLibrary,
} from '@/storage';
import { loadCore } from '../../tests/loadCore';
import { createDashboardController } from './createDashboardController';
import { createInitialState } from './createInitialState';
import { createStore } from './createStore';

async function setup() {
    const storage = createMemoryStorage();
    const library = createDemoLibrary(10);
    await saveLibrary(storage, library);
    const store = createStore(createInitialState(true));
    let time = new Date(2026, 8, 16).getTime();
    const clock = {
        advance: (ms: number) => {
            time += ms;
        },
    };
    const controller = createDashboardController(store, {
        storage,
        core: loadCore(),
        fetchText: () => Promise.reject(new Error('offline')),
        sleep: () => Promise.resolve(),
        parseHtml: (html) =>
            new DOMParser().parseFromString(html, 'text/html'),
        requestAccess: () => Promise.resolve(true),
        download: () => undefined,
        confirm: () => true,
        now: () => new Date(time),
        createDemo: () => createDemoLibrary(10),
    });
    await controller.load();
    return { storage, library, store, controller, clock };
}

describe('removing works', () => {
    it('hides a work and remembers it in storage', async () => {
        const { storage, library, store, controller } = await setup();
        const [first] = library.works;
        if (!first) {
            throw new Error('no demo works');
        }
        await controller.removeWork(first);

        const shown = store.get().library?.works ?? [];
        expect(shown).toHaveLength(library.works.length - 1);
        expect(shown.some((w) => w.key === first.key)).toBe(false);

        const saved = await loadActiveLibrary(storage);
        expect(saved?.works).toHaveLength(library.works.length);
        expect(saved?.removed).toEqual([first.key]);

        await controller.load();
        expect(store.get().library?.works).toHaveLength(
            library.works.length - 1,
        );
    });

    it('brings removed works back', async () => {
        const { storage, library, store, controller } = await setup();
        for (const work of library.works.slice(0, 2)) {
            await controller.removeWork(work);
        }
        await controller.restoreRemoved();

        expect(store.get().library?.works).toHaveLength(library.works.length);
        expect(store.get().sync.notice).toBe('Restored 2 removed works.');
        expect((await loadActiveLibrary(storage))?.removed).toEqual([]);
    });
});

describe('reading speed', () => {
    it('loads, clamps and saves the words per minute', async () => {
        const { storage, store, controller } = await setup();
        expect(store.get().wordsPerMinute).toBe(250);

        await controller.setWordsPerMinute(99_999);
        expect(store.get().wordsPerMinute).toBe(1500);

        await controller.setWordsPerMinute(312.4);
        expect(await loadWordsPerMinute(storage)).toBe(312);
    });

    it('measures a speed test and saves the result', async () => {
        const { storage, store, controller, clock } = await setup();
        controller.startSpeedTest();
        clock.advance(60_000);
        await controller.finishSpeedTest(300);
        expect(store.get().speedTest).toEqual({
            startedAt: null,
            result: 300,
            tooFast: false,
        });
        expect(store.get().wordsPerMinute).toBe(300);
        expect(await loadWordsPerMinute(storage)).toBe(300);
    });

    it('ignores a test finished impossibly fast', async () => {
        const { store, controller, clock } = await setup();
        controller.startSpeedTest();
        clock.advance(1_000);
        await controller.finishSpeedTest(300);
        expect(store.get().speedTest.result).toBeNull();
        expect(store.get().speedTest.tooFast).toBe(true);

        controller.startSpeedTest();
        clock.advance(8_000);
        await controller.finishSpeedTest(300);
        expect(store.get().speedTest.tooFast).toBe(true);
        expect(store.get().wordsPerMinute).toBe(250);
    });
});
