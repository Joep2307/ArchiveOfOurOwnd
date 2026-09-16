import { createDemoLibrary } from '@/demo';
import {
    createMemoryStorage,
    loadActiveLibrary,
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
        now: () => new Date(2026, 8, 16),
        createDemo: () => createDemoLibrary(10),
    });
    await controller.load();
    return { storage, library, store, controller };
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
