import { isArray, isObject } from "@vue/shared";
import { createVNode, isVNode, VNode } from "./vnode";

/**
 * @h函数
 * 使用h函数可以生成vnode
 */

export function h(type: any, propsOrChildren?: any, children?: any): VNode {
    const l = arguments.length
    if (l === 2) {
        // 是对象不是数组 可能是props或者array children
        if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
            // 是VNOde那第二个参数就是children
            if (isVNode(propsOrChildren)) {
                return createVNode(type, null, [propsOrChildren])
            }
            // 是对象不是VNode,那就是props
            return createVNode(type, propsOrChildren, null)

        } else {
            return createVNode(type, null, propsOrChildren)
        }

    } else {
        if (l > 3) {
            children = Array.prototype.slice.call(arguments, 2)
        } else if (l === 3 && isVNode(children)) {
            children = [children]
        }
        return createVNode(type, propsOrChildren, children)
    }
}



