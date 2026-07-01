import { ComputedRefImpl } from "./computed";
import { Dep } from "./dep";
export type KeyToDepMap = Map<any, Dep>;
export type EffectScheduler = (...args: any[]) => any;
/**
 * @activeEffect
 */
export declare let activeEffect: ReaciveEffect | undefined;
/**
 * @effect主函数
 * @param fn
 */
export declare function effect<T = any>(fn: () => T, options?: ReaciveEffectOptions): void;
/**
 * @effect依赖类
 */
export declare class ReaciveEffect<T = any> {
    fn: () => T;
    scheduler: EffectScheduler | null;
    computed?: ComputedRefImpl<T>;
    constructor(fn: () => T, scheduler?: EffectScheduler | null);
    run(): T;
}
/**
 * @懒执行选择项
 */
export interface ReaciveEffectOptions {
    lazy?: boolean;
    scheduler?: EffectScheduler;
}
/**
 * @收集依赖
 * @param target
 * @param key
 * @returns
 */
export declare function track(target: object, key: string | symbol): void;
/**
 * @收集一个key的所有依赖
 * @param dep
 * @returns
 */
export declare const trackEffects: (dep: Dep) => Dep;
/**
 * @trigglce触发依赖
 * @param target
 * @param key
 * @param value
 * @returns
 */
export declare function triggle(target: object, key: string | symbol, value: unknown): void;
/**
 * @触发一个响应式对象属性key的所有依赖
 * @param dep
 */
export declare const triggleEffects: (dep: Dep) => void;
