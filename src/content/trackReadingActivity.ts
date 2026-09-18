import { parseUsername } from '@/parse';
import { workIdFromHref } from './workIdFromHref';
import type { ActivityUpdate } from './readingActivity';

export const IDLE_MS = 120000;

/** Excludes suspended timers, hidden tabs, idle time and text off-screen. */
export function activeElapsed(
    elapsed: number,
    sinceInput: number,
    active: boolean,
): number {
    if (!active || elapsed <= 0 || elapsed > 5000) return 0;
    return Math.min(elapsed, Math.max(0, IDLE_MS - sinceInput));
}

export function trackReadingActivity(
    doc: Document,
    send: (update: ActivityUpdate) => Promise<unknown>,
): () => void {
    const win = doc.defaultView;
    const username = parseUsername(doc);
    const workId = workIdFromHref(doc.location.pathname);
    if (!win || !username || workId === null) return () => undefined;
    const bodies = Array.from(
        doc.querySelectorAll<HTMLElement>(
            '#chapters .userstuff[role="article"], ' +
                '#chapters .chapter > .userstuff, #chapters > .userstuff',
        ),
    ).filter((body) => !body.closest('.notes, .summary, .preface'));
    const chapters = bodies.flatMap((body) => {
        const parent = body.closest('.chapter');
        const number =
            /Chapter\s+(\d+)/i.exec(
                parent?.querySelector('.title')?.textContent ?? '',
            )?.[1] ?? /^chapter-(\d+)$/.exec(parent?.id ?? '')?.[1];
        const posted = Number(
            (doc.querySelector('dd.chapters')?.textContent ?? '1').split(
                '/',
            )[0],
        );
        const chapter = number ? Number(number) : posted === 1 ? 1 : null;
        return chapter === null
            ? []
            : [
                  {
                      body,
                      chapter,
                      activeMs: 0,
                      reachedEnd: false,
                      savedMs: -1,
                      savedEnd: false,
                      session: crypto.randomUUID(),
                  },
              ];
    });
    if (!chapters.length) return () => undefined;
    let lastTick = performance.now();
    let lastInput = lastTick;
    let lastSave = lastTick;
    let active = false;
    let suspended = false;
    const eligible = (): boolean =>
        !suspended && doc.visibilityState === 'visible' && doc.hasFocus();
    const tick = (): void => {
        const now = performance.now();
        const ms = activeElapsed(
            now - lastTick,
            lastTick - lastInput,
            active && eligible(),
        );
        const visible = chapters.find(({ body }) => {
            const rect = body.getBoundingClientRect();
            return (
                rect.height > 0 &&
                rect.top < win.innerHeight &&
                rect.bottom > 0
            );
        });
        if (visible && ms > 0) {
            visible.activeMs += ms;
            const bottom = visible.body.getBoundingClientRect().bottom;
            if (bottom > 0 && bottom <= win.innerHeight + 40) {
                visible.reachedEnd = true;
            }
        }
        lastTick = now;
        active = eligible();
    };
    const flush = (): void => {
        for (const chapter of chapters) {
            if (
                chapter.activeMs === chapter.savedMs &&
                chapter.reachedEnd === chapter.savedEnd
            )
                continue;
            const snapshot = {
                username,
                workId,
                chapter: chapter.chapter,
                session: chapter.session,
                activeMs: chapter.activeMs,
                reachedEnd: chapter.reachedEnd,
            };
            void send(snapshot)
                .then(() => {
                    chapter.savedMs = Math.max(
                        chapter.savedMs,
                        snapshot.activeMs,
                    );
                    chapter.savedEnd ||= snapshot.reachedEnd;
                })
                .catch(() => undefined);
        }
        lastSave = performance.now();
    };
    const input = (event: Event): void => {
        if (!event.isTrusted) return;
        tick();
        lastInput = performance.now();
    };
    const changed = (): void => {
        tick();
        flush();
    };
    const hide = (): void => {
        tick();
        suspended = true;
        flush();
    };
    const show = (): void => {
        suspended = false;
        lastTick = performance.now();
        lastInput = lastTick;
        active = eligible();
    };
    active = eligible();
    flush();
    const timer = win.setInterval(() => {
        tick();
        if (performance.now() - lastSave >= 10000) flush();
    }, 1000);
    const inputs = [
        'scroll',
        'pointerdown',
        'pointermove',
        'keydown',
        'touchstart',
    ] as const;
    inputs.forEach((type) => {
        win.addEventListener(type, input, { passive: true });
    });
    doc.addEventListener('visibilitychange', changed);
    win.addEventListener('focus', changed);
    win.addEventListener('blur', changed);
    win.addEventListener('pagehide', hide);
    win.addEventListener('pageshow', show);
    return () => {
        tick();
        flush();
        win.clearInterval(timer);
        inputs.forEach((type) => {
            win.removeEventListener(type, input);
        });
        doc.removeEventListener('visibilitychange', changed);
        win.removeEventListener('focus', changed);
        win.removeEventListener('blur', changed);
        win.removeEventListener('pagehide', hide);
        win.removeEventListener('pageshow', show);
    };
}
