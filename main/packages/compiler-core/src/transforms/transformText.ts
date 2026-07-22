import { NodeTypes } from "../parse"

/**
 * @transformText不理解是什么作用
 * @param node 
 * @param context 
 * @returns 一个函数
 */
export const transformText = (node, context) => {
    if (node.type === NodeTypes.ROOT ||
        node.type === NodeTypes.ELEMENT ||
        node.type === NodeTypes.FOR ||
        node.type === NodeTypes.IF_BRANCH
    ){
        return ()=>{

        }
    }
}