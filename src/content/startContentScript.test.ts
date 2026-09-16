import { createDemoLibrary } from '@/demo';
import {
    createMemoryStorage,
    loadOpenedWorkIds,
    saveHighlightSetting,
    saveLibrary,
    type StorageArea,
} from '@/storage';
import { loadFixture } from '../../tests/fixtures/loadFixture';
import { NAV_CLASS, READ_CLASS } from './constants';
import { startContentScript } from './startContentScript';

function loadPage(): void {
    const html = loadFixture('works-listing.html');
    document.body.innerHTML = /<body>([\s\S]*)<\/body>/.exec(html)?.[1] ?? '';
}

async function start(storage: StorageArea, pathname = '/works') {
    const listeners: (() => void)[] = [];
    const openDashboard = vi.fn();
    await startContentScript(document, {
        storage,
        pathname,
        openDashboard,
        onStorageChange: (listener) => listeners.push(listener),
    });
    const changed = async (): Promise<void> => {
        for (const listener of listeners) {
            listener();
        }
        await new Promise((resolve) => setTimeout(resolve, 0));
    };
    return { openDashboard, changed };
}

async function storageWithHistory(): Promise<StorageArea> {
    const storage = createMemoryStorage();
    const library = createDemoLibrary(5);
    const [first] = library.works;
    if (first) {
        first.id = 1001;
    }
    await saveLibrary(storage, { ...library, username: 'reader_one' });
    return storage;
}

describe('startContentScript', () => {
    beforeEach(loadPage);

    it('highlights history and links to the dashboard', async () => {
        const { openDashboard } = await start(await storageWithHistory());
        expect(document.querySelector('#work_1001')?.classList).toContain(
            READ_CLASS,
        );
        const link = document.querySelector<HTMLAnchorElement>(
            `#header .primary .${NAV_CLASS} a`,
        );
        expect(link?.textContent).toBe('Reading stats');
        link?.click();
        expect(openDashboard).toHaveBeenCalledOnce();
    });

    it('asks to sync when nothing is stored', async () => {
        await start(createMemoryStorage());
        expect(document.querySelector(`.${NAV_CLASS}`)?.textContent).toBe(
            'Sync reading stats',
        );
        expect(document.querySelector(`.${READ_CLASS}`)).toBeNull();
    });

    it('remembers the work you open', async () => {
        const storage = createMemoryStorage();
        await start(storage, '/works/2002/chapters/9');
        expect(await loadOpenedWorkIds(storage, 'reader_one')).toEqual([2002]);
        expect(document.querySelector('#work_2002')?.classList).toContain(
            READ_CLASS,
        );
    });

    it('follows the setting when it changes', async () => {
        const storage = await storageWithHistory();
        const { changed } = await start(storage);
        await saveHighlightSetting(storage, false);
        await changed();
        expect(document.querySelector(`.${READ_CLASS}`)).toBeNull();
        expect(document.querySelector(`.${NAV_CLASS}`)).not.toBeNull();
    });
});
