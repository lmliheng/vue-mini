/**
 * @元素操作
 */
export declare const nodeOps: {
    insert: (child: any, parent: any, anchor: any) => void;
    createElement: (tag: any) => Element;
    setElementText: (el: any, text: any) => void;
    remove: (child: any) => void;
    createText: (text: any) => Text;
    setText: (node: any, text: any) => void;
    createComment: (text: any) => Comment;
};
