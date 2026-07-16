/**
 * @属性更新
 * class，style，value，type等属性更新需要不同的方法
 * 
 */
import { isOn } from "@vue/shared";
import { patchClass } from './module/patchClass'
import { patchDOMProp } from "./module/patchDOMProp";
import { attrs } from "./module/attrs";
import { patchStyle } from "./module/patchStyle";

export const patchProp = (el: Element, key, prevValue, nextValue) => {

    if (key === 'class') {
        patchClass(el, nextValue)
    } else if (key === 'style') {
        patchStyle(el, prevValue, nextValue)
    } else if (isOn(key)) {

        // to do 事件

    } else if (shouldSetAsProp(el, key)) {
        //
        patchDOMProp(el, key, nextValue)
    } else {
        // id,
        attrs(el, key, nextValue)
    }

}

/**
* @判断是否用DOMproperity还是setAttribute
 */
export function shouldSetAsProp(el: Element, key: string) {
    if (key === 'form') {
        return false
    }
    if (key === 'list' && el.tagName === 'INPUT') {
        return false
    }

    if (key === 'type' && el.tagName === 'TEXTAREA') {
        return false
    }
    return key in el
}