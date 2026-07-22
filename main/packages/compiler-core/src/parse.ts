
export interface ParseContext {
    source: string
}

/**
 * parse
 * 生成AST
 * 
 * 再转化为js AST
 */

export function baseParse(content: string) {
    // 生成parseContext
    const context = createParseContext(content)
    // 解析context
    const children = parseChildren(context, [])
    return createRoot(children)
}

function createParseContext(content: string): ParseContext {
    return {
        source: content
    }
}


export function createRoot(children) {
    return {
        type: NodeTypes.ROOT,
        children,
        loc: {}
    }
}


/**
 * @节点类型
 */
export enum NodeTypes {
    ROOT,
    ELEMENT,
    TEXT,
    COMMENT,
    SIMPLE_EXPRESSION,
    INTERPOLATION,
    ATTRIBUTE,
    DIRECTIVE,
    // containers
    COMPOUND_EXPRESSION,
    IF,
    IF_BRANCH,
    FOR,
    TEXT_CALL,
    // codegen
    VNODE_CALL,
    JS_CALL_EXPRESSION,
    JS_OBJECT_EXPRESSION,
    JS_PROPERTY,
    JS_ARRAY_EXPRESSION,
    JS_FUNCTION_EXPRESSION,
    JS_CONDITIONAL_EXPRESSION,
    JS_CACHE_EXPRESSION,

    // ssr codegen
    JS_BLOCK_STATEMENT,
    JS_TEMPLATE_LITERAL,
    JS_IF_STATEMENT,
    JS_ASSIGNMENT_EXPRESSION,
    JS_SEQUENCE_EXPRESSION,
    JS_RETURN_STATEMENT,
}
export enum ElementTypes {
    ELEMENT,

    COMPONENT,
    // 插槽
    SLOT,
    //template
    TEMPLATE,
}

const enum TagType {
    Start,
    End
}

/**
 * 对标签处理的入口函数
 * 有parseChildren和parseTag函数
 */
// NOTE: context: ParseContext
function parseElement(context, ancestors) {
    const element = parseTag(context, TagType.Start)
    ancestors.push(element)
    const children = parseChildren(context, ancestors)
    ancestors.pop()
    element.children = children
    if (startWithEndTagOpen(context.source, element.tag)) {
        parseTag(context, TagType.End)
    }
    // 处理完后返回element
    return element
}

/**
 * 解析标签
 */
function parseTag(context: any, type: TagType): any {
    // NOTE： 这个正则表达式是什么意思
    const match: any = /^<\/?([a-z][^\r\n\t\f />]*)/i.exec(context.source)
    const tag = match[1]
    advanceBy(context, match[0].length)

    let isSelfClosing = startWith(context.source, '/>')

    advanceBy(context, isSelfClosing ? 2 : 1)

    let tagType = ElementTypes.ELEMENT

    return {
        type: NodeTypes.ELEMENT,
        tag,
        tagType,
        // 属性的解析待处理
        props: []
    }
}

/**
 * 核心函数
 */
function parseChildren(context: ParseContext, ancestors) {
    const nodes = []

    //NOTE : 这个while做了什么
    while (!isEnd(context, ancestors)) {
        const s = context.source
        let node
        if (startWith(s, '{{')) {

        } else if (s[0] === '<') {
            if (/[a-z]/i.test(s[1] as string)) {
                node = parseElement(context, ancestors)
            }

        }
        // 如果node不存在，那么tokens是文本节点
        if (!node) {
            node = parseText(context)
        }
        pushNode(nodes, node)

    }

    return nodes
}


/**
 * @advanceBy
 * 起到一种状态的转变，在多个函数里使用，表示context.source的不断截短
 * 对context的source属性 从numberofcharacters到末尾的索引截取
 */
function advanceBy(context, numberOfCharacters: number): void {
    const { source } = context
    context.source = source.slice(numberOfCharacters)
}

/**
 * 从<结束,
 * 
 */
function parseText(context) {
    const endTokens = ['<', '{{']
    let endIndex = context.source.length

    // 找到最后一个结束标志，如果是...<{{...，得到{{的索引
    for (let i = 0; i < endTokens.length; i++) {
        const index = context.source.indexOf(endTokens[i], 1)
        if (index !== -1 && endIndex > index) {
            endIndex = index
        }

    }
    const content = parseTextData(context, endIndex)
    return {
        type: NodeTypes.TEXT,
        content

    }

}

function parseTextData(context: ParseContext, length: number): string {
    const rawText = context.source.slice(0, length)
    // context.source 后移length单位长度
    advanceBy(context, length)
    return rawText
}

/**
 * startwith
 * 也就是startswith
 */
function startWith(source: string, searchString): boolean {
    return source.startsWith(searchString)
}

/**
 * 
 * ancestors是什么,是一个数组
 */
// context: ParserContext
function isEnd(context: ParseContext, ancestors): boolean {
    const s = context.source
    if (startWith(s, '</')) {
        for (let i = ancestors.length - 1; i >= 0; i--) {
            if (startWithEndTagOpen(s, ancestors[i].tag)) {
                return true
            }
        }
    }
    return !s
}

/**
 * 
 */
function startWithEndTagOpen(source: string, tag: string): boolean {
    return ((startWith(source, '</')) &&
        (source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase()) &&
        (/[\t\r\n\f />]/.test(source[2 + tag.length] || '>')))
}


function pushNode(nodes, node): void {
    nodes.push(node)
}