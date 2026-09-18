import type { Library, ReadingReview } from '@/model';
import type { StorageArea } from '@/storage/StorageArea';

export const ACTIVITY_MESSAGE = 'reading-stats-active-reading';
export const activityKey = (username: string): string =>
    `readingActivity:${username}`;

export type ReadingActivity = {
    activeMs: number;
    chapters: Record<string, boolean>;
    /** Cumulative counters make retries and duplicate messages harmless. */
    sessions: Record<string, number>;
    updatedAt: string;
};
export type ActivityUpdate = {
    username: string;
    workId: number;
    chapter: number;
    session: string;
    activeMs: number;
    reachedEnd: boolean;
};

/** Called serially by the background worker. No library rewrites. */
export async function saveActivity(
    storage: StorageArea,
    update: ActivityUpdate,
): Promise<void> {
    const key = activityKey(update.username);
    const stored = await storage.get([key]);
    const records = (stored[key] ?? {}) as Record<string, ReadingActivity>;
    const workKey = `work-${update.workId}`;
    const before = records[workKey];
    const previous = before?.sessions[update.session] ?? 0;
    const delta = Math.min(15000, Math.max(0, update.activeMs - previous));
    records[workKey] = {
        activeMs: (before?.activeMs ?? 0) + delta,
        chapters: {
            ...before?.chapters,
            [update.chapter]:
                Boolean(before?.chapters[update.chapter]) || update.reachedEnd,
        },
        sessions: {
            ...before?.sessions,
            [update.session]: Math.max(previous, update.activeMs),
        },
        updatedAt: new Date().toISOString(),
    };
    await storage.set({ [key]: records });
}

/** Manual answers always win; activity is an estimate, never proof. */
export function applyActivity(
    library: Library,
    records: Record<string, ReadingActivity>,
    wordsPerMinute: number,
): Library {
    const reviews = { ...library.reviews };
    for (const work of library.works) {
        const activity = records[work.key];
        if (work.kind !== 'work' || !activity || work.words <= 0) continue;
        if (reviews[work.key] && reviews[work.key]?.source !== 'activity') {
            continue;
        }
        const expectedMs = (work.words / wordsPerMinute) * 60000;
        const allChapters = Array.from(
            { length: Math.max(1, work.chaptersPosted) },
            (_, index) => activity.chapters[String(index + 1)] === true,
        ).every(Boolean);
        const finished = allChapters && activity.activeMs >= expectedMs;
        const status: ReadingReview['status'] = finished
            ? 'finished'
            : activity.activeMs < Math.min(60000, expectedMs * 0.1)
              ? 'opened'
              : 'partial';
        reviews[work.key] = {
            status,
            words:
                status === 'partial'
                    ? Math.min(
                          work.words,
                          Math.floor(
                              (activity.activeMs / 60000) * wordsPerMinute,
                          ),
                      )
                    : work.words,
            ...(finished ? { readCount: 1 } : {}),
            reviewedAt: activity.updatedAt,
            source: 'activity',
            activeMs: activity.activeMs,
        };
    }
    return { ...library, reviews };
}
