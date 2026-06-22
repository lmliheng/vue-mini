import { ComputedRefImpl } from "./computed";
import { Dep } from "./dep";
export type EffectScheduler = (...args: any[]) => any;
export declare function track(target: object, key: string | symbol): void;
export declare const trackEffects: (dep: Dep) => Dep;
export declare function triggle(target: object, key: string | symbol, value: unknown): void;
export declare const triggleEffects: (dep: Dep) => void;
export declare function effect<T = any>(fn: () => T): void;
export declare let activeEffect: ReaciveEffect | undefined;
/**
 * 依赖类
 */
export declare class ReaciveEffect<T = any> {
    fn: () => T;
    scheduler: EffectScheduler | null;
    computed?: ComputedRefImpl<T>;
    constructor(fn: () => T, scheduler?: EffectScheduler | null);
    run(): T;
}
