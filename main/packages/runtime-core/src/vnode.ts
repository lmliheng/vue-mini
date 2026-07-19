
import { isArray, isFunction, isObject, isString } from "@vue/shared"
import { normalizeClass } from "packages/shared/src/normalizeProps"
import { ShapeFlags } from "packages/shared/src/shapeFlags"


// TODO: vnode的 __v_skip是什么属性，在哪个文件里定义的
export interface VNode {
    __v_isVNode: true
    type: any
    props: any
    children: any
    shapeFlag: number
    // component属性参考component instance部分
    component: any
    // el属性需要声明吗
}

// 组件: 进入isObeject 进入shapefalgs.stateful_comonent
export const Fragment = Symbol('Fragment') // 段
export const Text = Symbol('Text')
export const Comment = Symbol('Comment')

/**
 * @h函数构建vnode的主要逻辑
 */
export function createVNode(type, props, children): VNode {
    if (props) {
        let { class: klass, style } = props
        if (klass && !isString(klass)) {
            props.class = normalizeClass(klass)
        }
        // style.
        // if()
    }

    const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : isObject(type) ? ShapeFlags.STATEFUL_COMPONENT : 0
    return createBaseVNode(type, props, children, shapeFlag)
}

function createBaseVNode(type, props, children, shapeFlag): VNode {
    const vnode = {
        __v_isVNode: true,
        type,
        props,
        shapeFlag
    } as VNode

    // 对props的class和style进行增强处理
    normalizeChildren(vnode, children)
    return vnode

}

/**
 * @处理h函数参数里的children属性
 * 改变shapeFlag
 * 传入的可能是'hello' , [vnode1,vnode2] ，1
 * 我在测试案例里写的是文本类型
 */
export function normalizeChildren(vnode, children) {
    let type = 0
    //const { shapeFlag } = vnode // 解构
    if (children == null) {
        children = null
    } else if (isArray(children)) {
        type = ShapeFlags.ARRAY_CHILDREN
    } else if (isFunction(children)) {

    } else {
        children = String(children)
        type = ShapeFlags.TEXT_CHILDREN
    }
    vnode.children = children
    vnode.shapeFlag |= type
}

export function isVNode(value: any): boolean {
    return value ? value.__v_isVNode === true : false
}


export function isSameVNodeType(n1, n2) {
    return n1.type === n2.type
}