/**
 * @组件工具
 * 
 */

import { isObject } from "@vue/shared";
import { createVNode } from "./vnode";

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