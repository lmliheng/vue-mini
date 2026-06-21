import { track, triggle } from './effect'

const get = createGetter()
const set = createSetter()

export const mutableHandlers: ProxyHandler<object> = {
    get,
    set
}

function createGetter() {
    return function get(target: object, key: string | symbol, receiver: object) {
        // 收集触发getter的函数
        const res = Reflect.get(target, key, receiver)
        track(target, key)
        return res

    }
}
function createSetter() {
    return function set(target: object, key: string | symbol, value: unknown, receiver: object) {
        const res = Reflect.set(target, key, value, receiver)
        triggle(target, key, value)
        return res
    }

}