// Normally I would use lodash.debounce
export function debounce<F extends (...args: any[]) => void>(aFunction: F): (...args: Parameters<F>) => void {
    let timeoutId: number | null = null;
    return function (...args: Parameters<F>) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = Number(setTimeout(() => {
            aFunction(...args);
        }, 200));
    }
}
