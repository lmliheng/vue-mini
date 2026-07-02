import { ComputedRefImpl } from "./computed";
import { Dep } from "./dep";
export type KeyToDepMap = Map<any, Dep>;
export type EffectScheduler = (...args: any[]) => any;
/**
 * @懒执行选择项
 */
export interface ReactiveEffectOptions {
    lazy?: boolean;
    scheduler?: EffectScheduler;
}
/**
 * @activeEffect
 */
export declare let activeEffect: ReactiveEffect | undefined;
/**
 * @effect主函数
 * @param fn
 */
export declare function effect<T = any>(fn: () => T, options?: ReactiveEffectOptions): void;
/**
 * @effect依赖类
 */
export declare class ReactiveEffect<T = any> {
    fn: () => T;
    scheduler: EffectScheduler | null;
    computed?: ComputedRefImpl<T>;
    constructor(fn: () => T, scheduler?: EffectScheduler | null);
    run(): T;
    stop(): void;
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
