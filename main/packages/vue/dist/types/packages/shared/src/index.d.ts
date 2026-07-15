export declare function sum(...args: any[]): number;
export declare const isString: (value: unknown) => boolean;
export declare const isArray: (value: unknown) => boolean;
export declare const isFunction: (value: unknown) => boolean;
export declare const isObject: (value: unknown) => boolean;
export declare const hasChanged: (newVal: any, oldVal: any) => boolean;
export declare const extend: {
    <T extends {}, U>(target: T, source: U): T & U;
    <T extends {}, U, V>(target: T, source1: U, source2: V): T & U & V;
    <T extends {}, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
    (target: object, ...sources: any[]): any;
};
/**
 * @空对象
 */
export declare const EMPTY_OBJ: {};
