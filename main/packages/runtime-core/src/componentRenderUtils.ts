/**
 * @组件工具
 * 
 */

import { isObject } from "@vue/shared";
import { createVNode } from "./vnode";
import { ShapeFlags } from "packages/shared/src/shapeFlags";

export function normalizeVNode(child) {
    if (isObject(child)) {
        return cloneIfMounted(child)
    } else {
        return createVNode(Text, null, child)
    }
}

export function cloneIfMounted(obj) {
    return obj
}



/**
 * instance 的vnode属性和render属性
 */
export function renderComponentRoot(instance) {
    const { vnode, render } = instance
    let result
    try {
        if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
            // render!()是什么写法
            result = normalizeVNode(render!())
        }
    }
    catch (err) {
        console.log(err)
    }
    return result
}

