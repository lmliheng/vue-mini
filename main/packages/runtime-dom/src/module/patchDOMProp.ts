/**
 * 通过 DOM properity指定属性
 */
export function patchDOMProp(el: Element, key: string, value: any) {
    try {
        el[key] = value
    } catch (el: any) {

    }
}