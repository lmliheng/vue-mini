
import { NodeTypes } from "./parse"
/**
 * @将ast转化为js的ast
 * @root传入AST对象
 * @option
 */
export function transform(root, option) {
    const context: TransformContext = createTransformContext(root, option)
    traverseNode(root, context)
}

export interface TransformContext {
    root
    // ParentNode是什么
    parent: ParentNode | null

    childIndex: Number

    currentNode

    helpers: Map<symbol, number>

    helper<T extends symbol>(name: T): T

    nodeTransforms: any[]
}

/**
 * @创建transformContext对象
 * @param root 
 * @param param1 
 * @returns 
 */
export function createTransformContext(
    root,
    { nodeTransforms = [] }
): TransformContext {

    const context: TransformContext = {
        nodeTransforms,
        root,
        helpers: new Map(),
        currentNode: root,
        parent: null,
        childIndex: 0,
        helper(name) {
            const count = context.helpers.get(name) || 0
            context.helpers.set(name, count + 1)
            return name

        },

    }

    return context
}


export function traverseNode(node, context: TransformContext) {
    context.currentNode = node
    // 获取每个node的transform转换方法
    const { nodeTransforms } = context

    const exitFns: any = []
    for (let i = 0; i < nodeTransforms.length; i++) {
        const onExit = nodeTransforms[i](node, context)
        if (onExit) {
            exitFns.push(onExit)
        }

    }

    // 根据node.type选择不同的处理
    switch (node.type) {
        case NodeTypes.ELEMENT:

        case NodeTypes.ROOT:
            traverseChildren(node, context)
            break
    }

    context.currentNode = node
    let i = exitFns.length
    while (i--) {
        exitFns[i]()
    }



}



export function traverseChildren(parent, context: TransformContext) {
    parent.children.forEach((node, index) => {
        context.parent = parent
        context.childIndex = index
        traverseNode(node, context)
    })

}

