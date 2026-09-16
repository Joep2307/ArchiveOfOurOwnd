import {
    createDashboardController,
    createInitialState,
    createStore,
    type DashboardDeps,
} from '@/app';
import { getBrowserApi } from '@/browser';
import { createDemoLibrary } from '@/demo';
import { downloadFile } from '@/export';
import { parseHtml } from '@/parse';
import { loadStatsCore, type StatsCore } from '@/stats';
import { createMemoryStorage, getExtensionStorage } from '@/storage';
import { browserFetchText, createWorkerSleep } from '@/sync';
import { mountDashboard } from '@/ui';
import { DEMO_QUERY_PARAM } from './constants';
import { createTimerWorker } from './createTimerWorker';
import { readThemePreference } from './readThemePreference';
import { requestAo3Access } from './requestAo3Access';
import { writeThemePreference } from './writeThemePreference';

export type BootOptions = {
    /** Override the wasm loader (tests). */
    core?: StatsCore;
    /** Override the storage (tests, preview). */
    deps?: Partial<DashboardDeps>;
};

/** Starts the dashboard page inside `root`. */
export async function bootDashboard(
    root: HTMLElement,
    options: BootOptions = {},
): Promise<void> {
    const standalone = getBrowserApi() === null;
    const core = options.core ?? (await loadStatsCore());
    const now = (): Date => new Date();

    const deps: DashboardDeps = {
        storage: getExtensionStorage() ?? createMemoryStorage(),
        core,
        fetchText: browserFetchText,
        sleep: createWorkerSleep(createTimerWorker()),
        parseHtml,
        requestAccess: requestAo3Access,
        download: downloadFile,
        confirm: (message) => window.confirm(message),
        now,
        createDemo: () => createDemoLibrary(640, now()),
        ...options.deps,
    };

    const store = createStore({
        ...createInitialState(standalone),
        theme: readThemePreference(),
    });
    const controller = createDashboardController(store, deps);
    store.subscribe((state, previous) => {
        if (state.theme !== previous.theme) {
            writeThemePreference(state.theme);
        }
    });

    mountDashboard(root, store, controller, core, now);
    await controller.load();

    const params = new URLSearchParams(window.location.search);
    if (params.has(DEMO_QUERY_PARAM)) {
        controller.showDemo();
    } else if (!standalone) {
        void controller.sync(false);
    }
}
