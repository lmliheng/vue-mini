
export function sum(...args) {
    let sum = 0
    for (let i = 0; i < arguments.length; i++) {
        sum += arguments[i]
    }
    return sum
}

export function isObject(value: unknown): boolean {
    return value !== null && typeof value === 'object'
}