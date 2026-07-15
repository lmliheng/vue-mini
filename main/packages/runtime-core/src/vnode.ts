
import { isArray, isFunction, isString } from "@vue/shared"
import { ShapeFlags } from "packages/shared/src/shapeFlags"

export interface VNode {
    __v_isVNode: true
    type: any
    props: any
    children: any
    shapeFlag: number
}

/**
 * @h函数构建vnode的主要逻辑
 */
export function createVNode(type, props, children): VNode {
    const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0
    return createBaseVNode(type, props, children, shapeFlag)
}

function createBaseVNode(type, props, children, shapeFlag): VNode {
    const vnode = {
        __v_isVNode: true,
        type,
        props,
        shapeFlag
    } as VNode

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