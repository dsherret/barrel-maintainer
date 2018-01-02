export function asyncTimeout(timeout: number) {
    return new Promise(resolve => {
        setTimeout(() => resolve(), timeout);
    });
}
