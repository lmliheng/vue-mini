import { isArray, extend } from "@vue/shared"
import { ComputedRefImpl } from "./computed"
import { createDep, Dep } from "./dep"

export type KeyToDepMap = Map<any, Dep>
export type EffectScheduler = (...args) => any

/**
 * @懒执行选择项
 */
export interface ReactiveEffectOptions {
    lazy?: boolean,
    scheduler?: EffectScheduler
}

/**
 * @activeEffect
 */
export let activeEffect: ReactiveEffect | undefined

/**
 * @用于存储响应式对象属性和它关联的依赖之间的关系
 */
const targetMap = new WeakMap<any, KeyToDepMap>()


/**
 * @effect主函数
 * @param fn 
 */
export function effect<T = any>(
    fn: () => T,
    options?: ReactiveEffectOptions
) {
    const _effect = new ReactiveEffect(fn)
    // options 存在就把option对象的属性加到effect对象里
    if (options) {
        extend(_effect, options)
    }
    if (!options || !options.lazy) {
        _effect.run()
    }

}

/**
 * @effect依赖类
 */
export class ReactiveEffect<T = any> {
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
    // todo
    stop() {

    }
}


/**
 * @收集依赖
 * @param target 
 * @param key 
 * @returns 
 */
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

/**
 * @收集一个key的所有依赖
 * @param dep 
 * @returns 
 */
export const trackEffects = (dep: Dep) => {
    return dep.add(activeEffect!) // ！非空断言操作符
}


/**
 * @trigglce触发依赖
 * @param target 
 * @param key 
 * @param value 
 * @returns 
 */
export function triggle(target: object, key: string | symbol, value: unknown) {
    // console.log('triggle: 依赖触发')
    const depsMap = targetMap.get(target)
    if (!depsMap) { return }
    const dep: Dep | undefined = depsMap.get(key)
    if (!dep) { return }
    triggleEffects(dep)
}


/**
 * @触发一个响应式对象属性key的所有依赖
 * @param dep 
 */
export const triggleEffects = (dep: Dep) => {
    let effects = isArray(dep) ? dep : [...dep]
    //先触发computed属性的依赖，再触发无computed属性的依赖
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




/**
 * 依赖effect的执行
 * @param effect 
 */
function triggleEffect(effect: ReactiveEffect) {
    // scheduler属性
    if (effect.scheduler) {
        effect.scheduler()
    } else {
        effect.run()
    }

}