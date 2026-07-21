/**
 * @render 渲染函数
 */

import { ShapeFlags } from "packages/shared/src/shapeFlags";
import { Fragment, isSameVNodeType, isVNode, normalizeChildren } from "./vnode";
import { nodeOps } from "packages/runtime-dom/src/nodeOps";
import { EMPTY_OBJ, isString } from '@vue/shared'
import { patchProp } from "packages/runtime-dom/src/patchProp";
import { normalizeVNode, renderComponentRoot } from "./componentRenderUtils";
import { createComponentInstance, setupComponent } from "./component";
import { ReactiveEffect } from "packages/reactivity/src/effect";
import { quenePreFlushCb } from "./scheduler";

export interface RendererOptions {
    /**
     * 更新dom中属性部分
     */
    patchProp(el: Element, key: string, prevValue: any, nextValue: any): void

    /**
     * 更新标签文本
     */
    setElementText(node: Element, text: string): void

    /**
     * 创建标签，或者叫元素
     */
    createElement(type: string)

    /**
     * 插入到dom树中
     */
    insert(el, parent: Element, anchor?): void

    remove(el): void

    setText(el, text): void

    createText(text)

    createComment(text)
}

/**
 * Render主逻辑
 */
export function createRenderer(option: RendererOptions) {
    return baseCreateRenderer(option)
}


// TODO:需要阅读baseCreateRender
function baseCreateRenderer(option: RendererOptions) {
    const {
        patchProp: hostPatchProp,
        insert: hostInsert,
        createElement: hostCreateElement,
        setElementText: hostSetElementText,
        remove: hostRemove,
        createText: hostCreateText,
        setText: hostSetText,
        createComment: hostCreateComment
    } = option

    /**
     * @元素更新入口
     * 包括挂载和更新两种操作，
     * 还有卸载
     */
    const processElement = (oldVNode, newVNode, container, anchor) => {

        // 挂载
        if (oldVNode === null) {

            mountElement(newVNode, container, anchor)
        } else {//更新
            patchElement(oldVNode, newVNode)
        }
    }

    /**
     * type是Text时进入
     * 
     */
    function processText(oldVNode, newVNode, container, anchor) {
        if (oldVNode === null) {
            newVNode.el = hostCreateText(newVNode.children as string)
            hostInsert(newVNode.el, container, anchor)
        } else {
            const el = (newVNode.el = oldVNode.el!)
            if (newVNode.children !== oldVNode.children) {
                hostSetText(el, newVNode.children as string)
            }
        }
    }


    function processCommentNode(oldVNode, newVNode, container, anchor) {
        if (oldVNode === null) {
            newVNode.el = hostCreateComment((newVNode.children as string || ''))
            hostInsert(newVNode.el, container, anchor)
        } else {
            // 不更新
            newVNode.el = oldVNode.el
        }
    }

    function processFragment(oldVNode, newVNode, container, anchor) {
        if (oldVNode === null) {
            mountChildren(newVNode.children, container, anchor)
        } else {
            patchChildren(oldVNode, newVNode, container, anchor)
        }
    }

    function processComponent(oldVNode, newVNode, container, anchor) {
        if (oldVNode === null) {
            mountComponent(newVNode, container, anchor)
        }
    }

    /**
     * 
     * @diff
     * 
     */
    const patchKeyedChildren = (oldChildren, newChildren, container, parentAnchor) => {
        let i = 0
        let oldChildrenEnd = oldChildren.length - 1
        let newChildrenEnd = newChildren.length - 1

        // 1. 从前向后同步
        while (i <= oldChildrenEnd && i <= newChildrenEnd) {
            const oldVNode = oldChildren[i]
            const newVNode = normalizeVNode(newChildren[i])
            if (isSameVNodeType(oldVNode, newVNode)) {
                patch(oldVNode, newVNode, container, null)
            } else {
                break
            }
            i++
        }

        // 2. 从后向前同步
        while (i <= oldChildrenEnd && i <= newChildrenEnd) {
            const oldVNode = oldChildren[oldChildrenEnd]
            const newVNode = normalizeVNode(newChildren[newChildrenEnd])
            if (isSameVNodeType(oldVNode, newVNode)) {
                patch(oldVNode, newVNode, container, null)
            } else {
                break
            }
            oldChildrenEnd--
            newChildrenEnd--
        }

        // 3. 新增节点（新列表更长）
        if (i > oldChildrenEnd) {
            if (i <= newChildrenEnd) {
                const nextPos = newChildrenEnd + 1
                const anchor = nextPos < newChildren.length ? newChildren[nextPos].el : parentAnchor
                while (i <= newChildrenEnd) {
                    patch(null, normalizeVNode(newChildren[i]), container, anchor)
                    i++
                }
            }
        }
        // 4. 删除节点（旧列表更长）
        else if (i > newChildrenEnd) {
            while (i <= oldChildrenEnd) {
                unmount(oldChildren[i])
                i++
            }
        }
        
        else {
            //NOTE: 乱序
           
        }
    }

    const mountComponent = (newVNode, container, anchor) => {
        newVNode.component = createComponentInstance(newVNode)
        const instance = newVNode.component
        //
        setupComponent(instance)
        // 
        setupRenderEffect(instance, newVNode, container, anchor)
    }

    /**
     * @
     * 这里面的children是一个数组或者字符串？
     */
    const mountChildren = (children, container, anchor) => {
        if (isString(children)) {
            children = children.split('')
        }
        for (let i = 0; i < children.length; i++) {
            const child = normalizeVNode(children[i])
            // const child = (children = normalizeVNode(children[i]))
            patch(null, child, container, anchor)
        }
    }



    const mountElement = (vnode, container, anchor) => {
        const { type, props, shapeFlag } = vnode
        const el = (vnode.el = hostCreateElement(type))

        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            hostSetElementText(el, vnode.children)
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(vnode.children, el, anchor)
        }

        if (props) {
            //for of 需要iterable ，如果是对象会报错
            for (const key in props) {
                hostPatchProp(el, key, null, props[key])
            }
        }
        hostInsert(el, container, anchor)
    }



    // 
    const patch = (oldVNode, newVNode, container, anchor = null) => {
        if (oldVNode && !isSameVNodeType(oldVNode, newVNode)) {
            unmount(oldVNode)
            oldVNode = null
        }

        if (oldVNode === newVNode) {
            return
        }
        const { type, shapeFlag } = newVNode
        switch (type) {
            case Text:
                processText(oldVNode, newVNode, container, anchor)
                break
            case Comment:
                processCommentNode(oldVNode, newVNode, container, anchor)
                break
            case Fragment:
                processFragment(oldVNode, newVNode, container, anchor)
                break
            default:

                if (shapeFlag & ShapeFlags.ELEMENT) {
                    // 元素
                    processElement(oldVNode, newVNode, container, anchor)
                } else if (shapeFlag & ShapeFlags.COMPONENT) {
                    // 组件
                    processComponent(oldVNode, newVNode, container, anchor)

                }
        }
    }

    /**
     * @卸载虚拟DOM
     */
    const unmount = (VNode) => {
        // 传入.el  DOM
        hostRemove(VNode.el)
    }

    /**
     * @元素更新
     */
    const patchElement = (oldVNode, newVNode) => {
        const el = (newVNode.el = oldVNode.el!)
        const oldProps = oldVNode.props || EMPTY_OBJ
        const newProps = newVNode.props || EMPTY_OBJ
        patchChildren(oldVNode, newVNode, el, null)
        // 不是patchProp
        patchProps(el, newVNode, oldProps, newProps)
    }


    /**
     * @更新vnode的children属性
     */
    const patchChildren = (oldVNode, newVNode, container, anchor) => {
        const c1 = oldVNode && oldVNode.children
        const prevShapeFlag = oldVNode ? oldVNode.shapeFlag : 0
        const c2 = newVNode.children
        const { shapeFlag } = newVNode
        // 新vn的children是文本
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            // 旧vn的children是数组
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                // 待定
                patchKeyedChildren(c1, c2, container, anchor)
            }
            if (c1 !== c2) {
                hostSetElementText(container, c2)
            }

            // 这里为什么要这样写if
        } else {
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                // diff计算
                patchKeyedChildren(c1, c2, container, anchor)



            } else {

                if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                    hostSetElementText(container, '')
                }
                if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {

                }

            }

        }


    }


    /**
     * @和patchProp有什么区别
     * 
     */
    const patchProps = (el, vnode, oldProp, newProp) => {
        if (oldProp !== newProp) {
            for (const key in newProp) {
                const next = newProp[key]
                const prev = oldProp[key]
                if (next !== prev) {
                    hostPatchProp(el, key, prev, next)
                }
            }
        }
        if (oldProp !== EMPTY_OBJ) {
            for (const key in oldProp) {
                if (!(key in newProp)) {
                    hostPatchProp(el, key, oldProp[key], null)
                }
            }
        }
    }


    /**
     * @组件渲染方法
     */
    const setupRenderEffect = (instance, initialVNode, container, anchor) => {

        /**
         * 组件更新方法
         */
        const componentUpdateFn = () => {
            if (!instance.isMounted) {
                const { bm, m } = instance
                if (bm) {
                    bm()
                }
                const subTree = (instance.subTree = renderComponentRoot(instance))
                patch(null, subTree, container, anchor)
                if (m) {
                    m()
                }
                initialVNode.el = subTree.el
                instance.isMounted = true
            } else {
                // 如果说组件已经挂载
                let { next, vnode } = instance
                if (!next) {
                    next = vnode
                }
                const nextTree = renderComponentRoot(instance)
                // 保存以前的subTree，并在下一步更新subTree属性
                const prevTree = instance.subTree
                instance.subTree = nextTree
                patch(prevTree, nextTree, container, anchor)
                // 更新next属性的el属性
                next.el = nextTree.el
            }
        }

        // NOTE：组件实例的effect属性 通过 fn和调度器创建effect依赖
        const effect = (instance.effect = new ReactiveEffect(
            componentUpdateFn,
            () => quenePreFlushCb(update)
        ))
        // NOTE: update函数就是 执行effect中回调函数
        const update = (instance.update = () => effect.run())
        update()
    }

    /**
     * @render入口 
     */
    const render = (vnode, container) => {

        if (vnode === null) {
            if (container._vnode) {
                //
                unmount(container._vnode)
            }
        } else {

            // 进入patch函数
            patch(container._vnode || null, vnode, container)
        }
        // 完成后 在container打上_vnode属性
        container._vnode = vnode
    }

    // 这样返回...
    return { render }

}


