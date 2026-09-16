/** Minutes as a readable span: `3 days 4 hours`, `45 min`. */
export function formatDuration(minutes: number): string {
    const total = Math.max(0, Math.round(minutes));
    if (total < 60) {
        return `${total} min`;
    }
    const hours = Math.floor(total / 60);
    if (hours < 48) {
        const rest = total % 60;
        return rest > 0 ? `${hours} h ${rest} min` : `${hours} h`;
    }
    const days = Math.floor(hours / 24);
    const restHours = hours % 24;
    return restHours > 0 ? `${days} days ${restHours} h` : `${days} days`;
}
