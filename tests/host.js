

export function createlogger() {
    const logs = [];
    return {
        logs,
        log: (message) => logs.push(message)
    };
}