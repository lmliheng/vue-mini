import { baseParse } from './parse'

export function baseCompile(template: string, option) {
    const ast = baseParse(template)
    console.log('ast:', ast)
    return {}
}