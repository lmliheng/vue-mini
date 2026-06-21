import { mutableHandlers } from "./baseHandler"

export const reactiveMap = new WeakMap<object, any>()

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
    proxyMap.set(target, proxy)
    return proxy

}