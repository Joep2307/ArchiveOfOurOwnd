import { activeElapsed, trackReadingActivity } from './trackReadingActivity';

afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    document.body.replaceChildren();
    window.history.replaceState({}, '', '/');
});

it('does not count hidden, idle or suspended time', () => {
    expect(activeElapsed(1000, 0, true)).toBe(1000);
    expect(activeElapsed(1000, 0, false)).toBe(0);
    expect(activeElapsed(1000, 120000, true)).toBe(0);
    expect(activeElapsed(1000, 119500, true)).toBe(500);
    expect(activeElapsed(60000, 0, true)).toBe(0);
});

it('tracks visible fic text and stops when the tab loses focus', async () => {
    vi.useFakeTimers();
    window.history.replaceState({}, '', '/works/42/chapters/123');
    document.body.innerHTML = `
        <nav id="greeting"><a href="/users/reader">reader</a></nav>
        <dd class="chapters">2/2</dd>
        <div id="chapters"><div class="chapter" id="chapter-2">
        <h3 class="title">Chapter 2</h3>
        <div class="userstuff" role="article">Story text.</div>
        </div></div>`;
    const focus = vi.spyOn(document, 'hasFocus').mockReturnValue(true);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
        top: 0,
        bottom: 500,
        height: 500,
    } as DOMRect);
    const send = vi.fn().mockResolvedValue(undefined);
    const stop = trackReadingActivity(document, send);
    await vi.advanceTimersByTimeAsync(10000);
    expect(send).toHaveBeenLastCalledWith(
        expect.objectContaining({
            username: 'reader',
            workId: 42,
            chapter: 2,
            activeMs: 10000,
            reachedEnd: true,
        }),
    );
    focus.mockReturnValue(false);
    window.dispatchEvent(new Event('blur'));
    await vi.advanceTimersByTimeAsync(10000);
    expect(send).toHaveBeenLastCalledWith(
        expect.objectContaining({
            activeMs: 10000,
        }),
    );
    stop();
});

it('does not track a login screen or pages without chapter text', () => {
    window.history.replaceState({}, '', '/works/42');
    document.body.innerHTML = '<nav id="greeting">Log in</nav>';
    const send = vi.fn().mockResolvedValue(undefined);
    const stop = trackReadingActivity(document, send);
    expect(send).not.toHaveBeenCalled();
    stop();
});
