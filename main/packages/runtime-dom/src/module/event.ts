
/**
 * @patchEvent更新DOM中的事件
 */

export function patchEvent(el: Element & { _vei?: object }, rawName: string, prevValue, nextValue) {
    const invokers = el._vei || (el._vei = {})
    const existingInvoker = invokers[rawName]
    // 存在缓存事件和新事件 确定是更新
    if (nextValue && existingInvoker) {
        existingInvoker.value = nextValue
    } else {
        const name = parseName(rawName)
        if (nextValue) {
            const invoker = (invokers[rawName] = createInvoker(nextValue))
            el.addEventListener(name, invoker)
        } else if (existingInvoker) {
            // 不存在新值 存在缓存值
            el.removeEventListener(name, existingInvoker)
            invokers[rawName] = undefined
        }
    }
}


function parseName(name: string) {
    return name.slice(2).toLowerCase()
}


/**
 * 创建invoker，使用value属性存储事件
 */
function createInvoker(initialValue) {
    const invoker = (e: Event) => {
        invoker.value && invoker.value()
    }
    invoker.value = initialValue
    return invoker
}