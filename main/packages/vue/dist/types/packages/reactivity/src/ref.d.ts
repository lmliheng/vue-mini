export interface Ref<T = any> {
    value: T;
}
export declare function ref(value: unknown): Ref<any>;
export declare function trackRefValue(ref: any): void;
export declare function trigglerRefValue(ref: any): void;
export declare const toReactive: <T extends unknown>(value: T) => T;
