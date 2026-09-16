import { bootDashboard } from '@/exe';
import { createMemoryStorage } from '@/storage';
import { loadCore } from './loadCore';

// jsdom does not provide Chrome extension APIs. Stub only the boundary.
afterEach(() => {
    vi.unstubAllGlobals();
    window.history.replaceState({}, '', '/');
});

function setup(extension: boolean) {
    const storage = createMemoryStorage();
    const contains = vi.fn().mockResolvedValue(true);
    const request = vi.fn().mockResolvedValue(true);
    if (extension) {
        vi.stubGlobal('chrome', {
            runtime: { id: 'test-extension' },
            storage: { local: storage },
            permissions: { contains, request },
        });
    }
    // An empty logged-in history avoids opening a dialog in this test.
    const fetchText = vi.fn((url: string) =>
        Promise.resolve({
            status: 200,
            url,
            retryAfter: null,
            text: '<nav id="greeting"><a href="/users/me">me</a></nav>',
        }),
    );
    const root = document.createElement('div');
    return { storage, contains, request, fetchText, root };
}

describe('dashboard startup sync', () => {
    it('syncs automatically using existing permission', async () => {
        const { storage, contains, request, fetchText, root } = setup(true);
        await bootDashboard(root, {
            core: loadCore(),
            deps: { storage, fetchText },
        });
        await vi.waitFor(() => {
            expect(fetchText).toHaveBeenCalledTimes(2);
        });
        expect(contains).toHaveBeenCalled();
        expect(request).not.toHaveBeenCalled();
    });

    it.each([false, true])(
        'does not sync demo mode (extension: %s)',
        async (extension) => {
            const { storage, fetchText, root } = setup(extension);
            window.history.replaceState({}, '', '/?demo');
            await bootDashboard(root, {
                core: loadCore(),
                deps: { storage, fetchText },
            });
            expect(fetchText).not.toHaveBeenCalled();
        },
    );

    it('does not sync a standalone preview', async () => {
        const { storage, fetchText, root } = setup(false);
        await bootDashboard(root, {
            core: loadCore(),
            deps: { storage, fetchText },
        });
        expect(fetchText).not.toHaveBeenCalled();
    });
});
