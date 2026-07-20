/**
 * @生命周期钩子
 */
export declare const enum LifeclcleHooks {
    BEFORE_CREATE = "bc",
    CREATE = "c",
    BEFORE_MOUNT = "bm",
    MOUNTED = "m"
}
/**
 * @注册hooks
 */
export declare function injectHook(type: LifeclcleHooks, hook: Function, target: any): Function | undefined;
/**
 * @创建一个指定的hook的方法
 *
 */
export declare const createHook: (lifecycle: LifeclcleHooks) => (hook: any, target: any) => Function | undefined;
/**
 * 创建bm钩子
 */
export declare const onBeforeMount: (hook: any, target: any) => Function | undefined;
/**
 * 创建m钩子
 */
export declare const onMounted: (hook: any, target: any) => Function | undefined;
