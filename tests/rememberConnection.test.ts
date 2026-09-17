import { bootDashboard } from '@/dashboard';
import { bridgeRequest } from '@/connection/pageBridge';
import { CONNECTION_KEY } from '@/connection/bridgeStorage';
import { showLoginDialog } from '@/connection/loginDialog';
import { createDemoLibrary } from '@/demo';
import { createMemoryStorage, saveLibrary } from '@/storage';
import { loadCore } from './loadCore';

vi.mock('@/connection/pageBridge', () => ({
    bridgeRequest: vi.fn().mockResolvedValue(true),
    bridgeFetchText: vi.fn(),
}));
vi.mock('@/connection/loginDialog', () => ({ showLoginDialog: vi.fn() }));

afterEach(() => {
    localStorage.clear();
    window.history.replaceState({}, '', '/');
    vi.clearAllMocks();
});

it('restores the account despite the old demo URL', async () => {
    localStorage.setItem(CONNECTION_KEY, 'true');
    window.history.replaceState({}, '', '/dashboard.html?demo');
    const storage = createMemoryStorage();
    await saveLibrary(storage, {
        ...createDemoLibrary(10),
        username: 'my_saved_account',
    });
    const requestAccess = vi.fn().mockResolvedValue(false);
    for (let reload = 0; reload < 2; reload++) {
        const root = document.createElement('div');
        await bootDashboard(root, {
            core: loadCore(),
            deps: { storage, requestAccess },
        });
        await vi.waitFor(() => {
            expect(
                root.querySelector('.header__account')?.textContent,
            ).toContain('my_saved_account');
        });
        expect(
            root.querySelector('.header__account')?.textContent,
        ).not.toContain('Demo data');
        expect(root.textContent).toContain('Disconnect and return to start');
    }
    expect(bridgeRequest).toHaveBeenCalledWith('resume');
    expect(bridgeRequest).not.toHaveBeenCalledWith('connect');
    expect(showLoginDialog).not.toHaveBeenCalled();
    expect(requestAccess).toHaveBeenCalledTimes(2);
});
