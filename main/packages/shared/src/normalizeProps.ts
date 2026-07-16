import { isArray, isObject, isString } from "."

/**
 * @对props里面的clas和style进行增强处理
 */
export function normalizeClass(value): string {
    let res = ''
    if (isString(value)) {
        res = value as string
    } else if (isArray(value)) {
        for (let i = 0; i < value.length; i++) {
            const normaized = normalizeClass(value[i])
            if (normaized) {
                res += normaized + ' '
            }
        }
    } else if (isObject(value)) {
        for (const class_name in value) {
            if (value[class_name]) {
                res += class_name + ' '
            }
        }
    }
    return res.trim()

}