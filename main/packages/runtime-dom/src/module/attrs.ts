/**
 * @通过setAttribute设置属性
 */
export function attrs(el: Element, key: string, value: any) {
    if (value == null) {
        el.removeAttribute(key)
    } else {
        el.setAttribute(key, value)
    }
}