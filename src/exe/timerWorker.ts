// Timer Web Worker entry point: echoes each id after its delay.

type TimerRequest = { id: number; ms: number };

type WorkerScope = {
    addEventListener(
        type: 'message',
        listener: (event: MessageEvent) => void,
    ): void;
    postMessage(message: unknown): void;
};

const scope = self as unknown as WorkerScope;

scope.addEventListener('message', (event) => {
    const { id, ms } = event.data as TimerRequest;
    setTimeout(() => {
        scope.postMessage({ id });
    }, ms);
});
