import { effect } from "@vue/reactivity"
import { render } from "@vue/runtime-dom"


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
        render: null! //组件内的render函数

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

}