import { parseUsername } from '@/parse';
import {
    addOpenedWorkId,
    loadActiveLibrary,
    loadHighlightSetting,
    loadLibrary,
    loadOpenedWorkIds,
} from '@/storage';
import { buildReadIndex } from './buildReadIndex';
import { clearMarks } from './clearMarks';
import {
    DASHBOARD_LINK_LABEL,
    REMARK_DELAY_MS,
    SYNC_LINK_LABEL,
} from './constants';
import type { ContentDeps } from './ContentDeps';
import { markReadWorks } from './markReadWorks';
import type { ReadIndex } from './ReadIndex';
import { setDashboardLink } from './setDashboardLink';
import { workIdFromHref } from './workIdFromHref';

/**
 * Runs on every AO3 page: highlights works from the stored history,
 * adds a dashboard link, and keeps both current after a sync.
 */
export async function startContentScript(
    doc: Document,
    deps: ContentDeps,
): Promise<void> {
    const { storage } = deps;
    const username = parseUsername(doc);
    const currentWorkId = workIdFromHref(deps.pathname);
    let index: ReadIndex = new Map();
    let enabled = false;
    let generation = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const observer = new MutationObserver(() => {
        clearTimeout(timer);
        timer = setTimeout(apply, REMARK_DELAY_MS);
    });

    function apply(): void {
        if (enabled) {
            markReadWorks(doc, index, currentWorkId);
        } else {
            clearMarks(doc);
        }
        // Our own badges are not a reason to mark again.
        observer.takeRecords();
    }

    async function refresh(): Promise<void> {
        const mine = ++generation;
        const library = username
            ? await loadLibrary(storage, username)
            : await loadActiveLibrary(storage);
        const owner = library?.username ?? username;
        const [opened, highlight] = await Promise.all([
            owner ? loadOpenedWorkIds(storage, owner) : [],
            loadHighlightSetting(storage),
        ]);
        if (mine !== generation) {
            return;
        }
        index = buildReadIndex(library, opened);
        enabled = highlight;
        setDashboardLink(
            doc,
            library ? DASHBOARD_LINK_LABEL : SYNC_LINK_LABEL,
            deps.openDashboard,
        );
        apply();
    }

    // AO3 only keeps History for logged-in readers.
    if (username && currentWorkId !== null) {
        await addOpenedWorkId(storage, username, currentWorkId);
    }
    await refresh();
    deps.onStorageChange(() => void refresh());
    observer.observe(doc.body, { childList: true, subtree: true });
}
