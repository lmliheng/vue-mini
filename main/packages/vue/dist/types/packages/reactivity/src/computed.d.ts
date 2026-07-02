import { Dep } from "./dep";
import { ReactiveEffect } from "./effect";
export declare class ComputedRefImpl<T> {
    dep?: Dep;
    private _value;
    readonly effect: ReactiveEffect<T>;
    readonly __v_isRef = true;
    _dirty: boolean;
    constructor(getter: any);
    get value(): T;
}
export declare function computed(getterOrOptions: any): ComputedRefImpl<unknown>;
