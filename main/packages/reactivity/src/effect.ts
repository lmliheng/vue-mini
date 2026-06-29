import { isArray } from "@vue/shared"
import { ComputedRefImpl } from "./computed"
import { createDep, Dep } from "./dep"

type KeyToDepMap = Map<any, Dep>

export type EffectScheduler = (...args) => any

const targetMap = new WeakMap<any, KeyToDepMap>()

export function track(target: object, key: string | symbol) { // key:unknown
    // console.log('track: 依赖收集')
    if (!activeEffect) { return }
    let depsMap = targetMap.get(target)
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()))
    }
    // 一个key(读取reactive对象的属性名)对应一个effect，存在问题
    let dep = depsMap.get(key)
    if (!dep) { depsMap.set(key, (dep = createDep())) }
    trackEffects(dep)
}

// 收集一个key的所有依赖
export const trackEffects = (dep: Dep) => {
    return dep.add(activeEffect!) // ！非空断言操作符
}

export function triggle(target: object, key: string | symbol, value: unknown) {
    // console.log('triggle: 依赖触发')
    const depsMap = targetMap.get(target)
    if (!depsMap) { return }
    const dep: Dep | undefined = depsMap.get(key)
    if (!dep) { return }
    triggleEffects(dep)
}

// 触发一个key的所有依赖
export const triggleEffects = (dep: Dep) => {
    let effects = isArray(dep) ? dep : [...dep]

    for (const effect of effects) {
        if (effect.computed) {
            triggleEffect(effect)
        }
    }
    for (const effect of effects) {
        if (!effect.computed) {
            triggleEffect(effect)
        }
    }
}

export function effect<T = any>(
    fn: () => T,
) {
    const _effect = new ReaciveEffect(fn)
    _effect.run()
}

// 收集getter行为函数
export let activeEffect: ReaciveEffect | undefined


/**
 * 依赖类
 */
export class ReaciveEffect<T = any> {

    computed?: ComputedRefImpl<T>
    constructor(
        public fn: () => T,
        public scheduler: EffectScheduler | null = null
    ) {
    }
    run() {
        activeEffect = this
        return this.fn()
    }
}

/**
 * 依赖effect执行
 * @param effect 
 */

function triggleEffect(effect: ReaciveEffect) {
    if (effect.scheduler) {
        effect.scheduler()
    } else {
        effect.run()
    }

}