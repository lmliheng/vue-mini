/**
 * @为class打补丁
 */
export function patchClass(el: Element, value: string) {
    if (value === null) {
        el.removeAttribute('class')

        // isSVG
    } else {
        // 比setAttribute更高效
        el.className = value
    }
}