import { mutableHandlers } from "./baseHandler"

export const reactiveMap = new WeakMap<object, any>()

export const enum ReactiveFlags {
    IS_RACTIVE = '__v_isReactive'
}

/**
 * @reactive响应式入口函数
 * @param 只能是object类型
 */

export function reactive(target: object) {
    return createReactiveObject(target, mutableHandlers, reactiveMap)
}

function createReactiveObject(
    target: object,
    baseHandlers: ProxyHandler<any>,
    proxyMap: WeakMap<object, any>
) {
    const existProxy = proxyMap.get(target)
    if (existProxy) { return existProxy }

    const proxy = new Proxy(target, baseHandlers)
    proxy[ReactiveFlags.IS_RACTIVE] = true
    proxyMap.set(target, proxy)
    return proxy

}

/**
 * @author liheng
 * @用于判断是否是Reactive类型
 */
export function isReactive(value): boolean {
    return !!(value && value[ReactiveFlags.IS_RACTIVE])
}