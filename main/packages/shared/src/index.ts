
export function sum(...args) {
    let sum = 0
    for (let i = 0; i < arguments.length; i++) {
        sum += arguments[i]
    }
    return sum
}

export const isArray = (value: unknown): boolean => value instanceof Array
export const isFunction = (value: unknown): boolean => typeof value === 'function'
export const isObject = (value: unknown): boolean => value !== null && typeof value === 'object'
export const hasChanged = (newVal: any, oldVal: any): boolean => !Object.is(newVal, oldVal)
export const extend = Object.assign


/**
 * @空对象
 */
export const EMPTY_OBJ = {}