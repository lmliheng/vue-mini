export interface Ref<T = any> {
    value: T;
}
export declare function ref(value: unknown): Ref<any>;
export declare function trackRefValue(ref: any): void;
export declare function trigglerRefValue(ref: any): void;
/**
 *
 * @是否是Ref类型
 * @returns boolean
 *
 */
export declare function isRef(r: any): r is Ref;
/**
 *
 * @入参值如果是对象就变成reactive类型
 * @returns
 */
export declare const toReactive: <T extends unknown>(value: T) => T;
