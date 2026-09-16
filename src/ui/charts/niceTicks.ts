/**
 * Round tick values from 0 up to at least `max`, e.g.
 * `niceTicks(87)` → `[0, 20, 40, 60, 80, 100]`.
 */
export function niceTicks(max: number, target = 4): number[] {
    if (max <= 0) {
        return [0, 1];
    }
    const rough = max / target;
    const power = 10 ** Math.floor(Math.log10(rough));
    const step =
        [1, 2, 2.5, 5, 10]
            .map((factor) => factor * power)
            .find((candidate) => candidate >= rough) ?? power * 10;
    const whole = Math.max(1, Math.round(step));
    const ticks: number[] = [];
    for (let value = 0; value < max + whole; value += whole) {
        ticks.push(value);
        if (value >= max) {
            break;
        }
    }
    return ticks;
}
