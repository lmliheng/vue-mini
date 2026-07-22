import { baseParse } from './parse'
import { extend } from '@vue/shared'
import { transform } from './transform'
import { transformElement } from './transforms/transformElement'
import { transformText } from './transforms/transformText'

export function baseCompile(template: string, option) {
    const ast = baseParse(template)
    // ast对象
    transform(ast, extend(option, { nodeTransforms: [transformElement, transformText] }))
    return {}
}