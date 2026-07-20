import { reactive } from "@vue/reactivity"
import { isFunction, isObject } from "@vue/shared"
import { onBeforeMount, onMounted } from "./apiLifecycle"
let uid = 0


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
        render: null!,//组件内的render函数

        isMounted: false,
        bc: null,
        c: null,
        bm: null,
        m: null,
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
    //NOTE: instance.type.setup属性是在哪定义的
    // 在type找到setup属性
    const component = instance.type
    const { setup } = component
    if (setup) {
        const setupResult = setup()
        handleSetResult(instance, setupResult)
    } else {
        finishComponentSetup(instance)
    }
}

function finishComponentSetup(instance) {
    const component = instance.type

    // 组件不存在时才重新赋值
    if (!instance.render) {
        instance.render = component.render
    }

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
        callHook(beforeCreate, instance.data)
    }

    if (dataOptions) {
        const data = dataOptions()
        if (isObject(data)) {
            // 数据是对象就进入reactive
            instance.data = reactive(data)
        }
    }

    if (create) {
        callHook(create, instance.data)
    }

    // NOTE: 这种写法
    function registerLifecycleHook(register: Function, hook?: Function) {
        register(hook?.bind(instance.data), instance)
    }
    registerLifecycleHook(onBeforeMount, beforeMount) //执行register（hook，instance）
    registerLifecycleHook(onMounted, mounted)
}

function callHook(hook: Function, proxy) {
    hook.bind(proxy)()
}



export function handleSetResult(instance, setupResult) {
    if (isFunction(setupResult)) {
        instance.render = setupResult
    }
    finishComponentSetup(instance)

}