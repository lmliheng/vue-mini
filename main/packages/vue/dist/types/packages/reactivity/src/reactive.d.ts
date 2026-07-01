export declare const reactiveMap: WeakMap<object, any>;
/**
 * @reactive响应式入口函数
 * @param 只能是object类型
 */
export declare function reactive(target: object): any;
/**
 * @author liheng
 * @用于判断是否是Reactive类型
 */
export declare function isReactive(): void;
