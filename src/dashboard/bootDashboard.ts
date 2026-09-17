import {
    createDashboardController,
    createInitialState,
    createStore,
    type DashboardDeps,
    viewFromHash,
} from '@/app';
import { getBrowserApi } from '@/browser';
import { createDemoLibrary } from '@/demo';
import { downloadFile } from '@/export';
import { parseHtml } from '@/parse';
import { loadStatsCore } from '@/stats';
import { getExtensionStorage } from '@/storage';
import { browserFetchText, createWorkerSleep } from '@/sync';
import { mountDashboard } from '@/ui';
import type { BootOptions } from './BootOptions';
import { DEMO_QUERY_PARAM } from './constants';
import { createTimerWorker } from './createTimerWorker';
import { readThemePreference } from './readThemePreference';
import { requestAo3Access } from './requestAo3Access';
import { writeThemePreference } from './writeThemePreference';
import { bridgeFetchText, bridgeRequest } from '@/connection/pageBridge';
import { showLoginDialog } from '@/connection/loginDialog';
import { bridgeStorage, CONNECTION_KEY } from '@/connection/bridgeStorage';

/** Starts the dashboard page inside `root`. */
export async function bootDashboard(
    root: HTMLElement,
    options: BootOptions = {},
): Promise<void> {
    const standalone = getBrowserApi() === null;
    const core = options.core ?? (await loadStatsCore());
    const now = (): Date => new Date();
    let connected = false;

    const deps: DashboardDeps = {
        storage: getExtensionStorage() ?? bridgeStorage(() => connected),
        core,
        fetchText: standalone ? bridgeFetchText : browserFetchText,
        sleep: createWorkerSleep(createTimerWorker()),
        parseHtml,
        requestAccess: standalone
            ? () => Promise.resolve(connected)
            : requestAo3Access,
        disconnectAccount: () => {
            void bridgeRequest('disconnect')
                .then(() => {
                    localStorage.removeItem(CONNECTION_KEY);
                    window.location.reload();
                })
                .catch(() => {
                    store.update((state) => ({
                        sync: {
                            ...state.sync,
                            error: {
                                code: 'unknown',
                                message:
                                    'Could not disconnect. ' +
                                    'Reload the extension and retry.',
                            },
                        },
                    }));
                });
        },
        connectAccount: async () => {
            const wasConnected = connected;
            if (standalone && !connected) {
                await bridgeRequest('ping');
                connected = await bridgeRequest<boolean>('connect');
                if (!connected) return false;
            }
            const proceed = await showLoginDialog(standalone);
            if (!proceed && standalone && !wasConnected) {
                connected = false;
                await bridgeRequest('disconnect');
            }
            if (proceed && standalone) {
                localStorage.setItem(CONNECTION_KEY, 'true');
                await controller.load();
            }
            return proceed;
        },
        download: downloadFile,
        confirm: (message) => window.confirm(message),
        now,
        createDemo: () => createDemoLibrary(640, now()),
        ...options.deps,
    };

    const store = createStore({
        ...createInitialState(standalone),
        theme: readThemePreference(),
        view: viewFromHash(window.location.hash) ?? 'dashboard',
    });
    const controller = createDashboardController(store, deps);
    store.subscribe((state, previous) => {
        if (state.theme !== previous.theme) {
            writeThemePreference(state.theme);
        }
    });

    mountDashboard(root, store, controller, core, now);
    let restoreError: string | null = null;
    if (standalone && localStorage.getItem(CONNECTION_KEY) === 'true') {
        try {
            await bridgeRequest('ping');
            connected = await bridgeRequest<boolean>('resume');
            if (!connected) localStorage.removeItem(CONNECTION_KEY);
            store.update({ accountConnected: connected });
        } catch (error) {
            restoreError =
                error instanceof Error
                    ? error.message
                    : 'Could not restore your connection.';
        }
    }
    try {
        await controller.load();
    } catch (error) {
        if (!standalone) throw error;
        connected = false;
        store.update({ accountConnected: false });
        restoreError =
            'Could not load saved history. ' +
            'Reload the extension and reconnect; your saved data is kept.';
        await controller.load();
    }

    const params = new URLSearchParams(window.location.search);
    const showDemo =
        options.demo ?? (!standalone && params.has(DEMO_QUERY_PARAM));
    if (showDemo) {
        controller.showDemo();
    }
    if ((!standalone || connected) && !showDemo) {
        void controller.sync(false);
    }
    if (restoreError) {
        store.update((state) => ({
            sync: {
                ...state.sync,
                error: { code: 'unknown', message: restoreError },
            },
        }));
    }
}
