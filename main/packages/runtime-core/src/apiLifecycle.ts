
//TODO：在生命周期中访问响应式数据

/**
 * @生命周期钩子
 */
export const enum LifeclcleHooks {
    BEFORE_CREATE = 'bc',
    CREATE = 'c',
    BEFORE_MOUNT = 'bm',
    MOUNTED = 'm'
}
/**
 * @注册hooks
 */
export function injectHook(
    type: LifeclcleHooks,
    hook: Function,
    target
): Function | undefined {
    //Note：target是什么
    if (target) {
        target[type] = hook
        return hook
    }
}

/**
 * @创建一个指定的hook的方法
 * 
 */
export const createHook = (lifecycle: LifeclcleHooks) => {
    return (hook, target) => injectHook(lifecycle, hook, target)
}

/**
 * 创建bm钩子
 */
export const onBeforeMount = createHook(LifeclcleHooks.BEFORE_MOUNT)
/**
 * 创建m钩子
 */
export const onMounted = createHook(LifeclcleHooks.MOUNTED)
