import { reactive } from "@vue/reactivity"
import { isObject } from "@vue/shared"
let uid = 0

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
 * 根据虚拟DOM创建组件实例
 */
export function createComponentInstance(vnode) {
    const type = vnode.type
    const instance = {
        // FIXME：isMounted在哪。
        uid: uid++,
        vnode,
        type, // 组件类型
        subTree: null!, // render函数返回值
        effect: null!, //reactiveEffect实例
        update: null!,
        render: null! ,//组件内的render函数

        isMounted:false,
        bc:null,
        c:null,
        bm:null,
        m:null,
    }
    return instance
}

/**
 * 规范化组件实例数据
 * 这有什么用?把type里的render函数赋给了instance的render属性
 */
export function setupComponent(instance) {
    const setupResult = setupStatefulComponent(instance)
    return setupResult

}

function setupStatefulComponent(instance) {
    finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
    const component = instance.type
    instance.render = component.render
    // NOTE: 改变options中的this指向
    applyOptions(instance)
}


function applyOptions(instance) {

    
    // instance type的data属性 和 dataOptions使用同一内存
    const {
        data: dataOptions,
        beforeCreate,
        create,
        beforeMount,
        mounted
    } = instance.type

    if (beforeCreate) {
        callHook(beforeCreate)
    }

    if (dataOptions) {

        const data = dataOptions()
        if (isObject(data)) {
            // 数据是对象就进入reactive
            instance.data = reactive(data)
        }
    }
}

function callHook(hook: Function) {
    hook()
}