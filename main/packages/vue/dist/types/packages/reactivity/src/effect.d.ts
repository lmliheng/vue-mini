export declare function track(target: object, key: string | symbol): void;
export declare function triggle(target: object, key: string | symbol, value: unknown): void;
export declare function effect<T = any>(fn: () => T): void;
export declare let activeEffect: ReaciveEffect | undefined;
export declare class ReaciveEffect<T = any> {
    fn: () => T;
    constructor(fn: () => T);
    run(): T;
}
