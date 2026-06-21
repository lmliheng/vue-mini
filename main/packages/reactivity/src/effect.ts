type KeyToDepMap = Map<any, ReaciveEffect>
const targetMap = new WeakMap<any, KeyToDepMap>()

export function track(target: object, key: string | symbol) { // key:unknown
    console.log('track: 依赖收集')
    if (!activeEffect) { return }
    let depsMap = targetMap.get(target)
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()))
    }
    depsMap.set(key, activeEffect) // keyToDepMap
    console.log(targetMap)
}
export function triggle(target: object, key: string | symbol, value: unknown) {
    console.log('triggle: 依赖触发')
    const depsMap = targetMap.get(target)
    if (!depsMap) { return }
    const effect = depsMap.get(key) as ReaciveEffect // 拿到依赖
    if (!effect) { return }
    effect.run()
}

export function effect<T = any>(
    fn: () => T,
) {
    const _effect = new ReaciveEffect(fn)
    _effect.run()
}

// 收集getter行为函数
export let activeEffect: ReaciveEffect | undefined

export class ReaciveEffect<T = any> {
    constructor(public fn: () => T) {
    }
    run() {
        activeEffect = this
        return this.fn()
    }
}

