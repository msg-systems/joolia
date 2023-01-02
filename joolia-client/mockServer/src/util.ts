export function offsetLimit(data: any[], offset?: number, limit?: number) {
    const start = offset || 0;
    let end = limit || 10;
    if (end > 50) {
        end = 50;
    }
    return data.slice(start, end);
}
