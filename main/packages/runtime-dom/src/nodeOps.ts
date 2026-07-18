/**
 * @元素操作
 */
export const nodeOps = {
    insert: (child, parent, anchor) => {
        parent.insertBefore(child, anchor || null)
    },
    createElement: (tag): Element => {
        return document.createElement(tag)
    },
    setElementText: (el, text) => {
        el.textContent = text
    },
    // child是一个VNode
    remove: (child) => {
        const parent = child.parentNode
        if (parent) {
            parent.removeChild(child)
        }
    },
    createText: (text) => {
        return document.createTextNode(text)
    },
    // node 是一个element
    setText: (node, text) => {
        node.nodeValue = text
    },
    createComment: (text) => {
        return document.createComment(text)
    }

}