export interface VNode {
    __v_isVNode: true;
    type: any;
    props: any;
    children: any;
    shapeFlag: number;
    component: any;
}
export declare const Fragment: unique symbol;
export declare const Text: unique symbol;
export declare const Comment: unique symbol;
/**
 * @h函数构建vnode的主要逻辑
 */
export declare function createVNode(type: any, props: any, children: any): VNode;
/**
 * @处理h函数参数里的children属性
 * 改变shapeFlag
 * 传入的可能是'hello' , [vnode1,vnode2] ，1
 * 我在测试案例里写的是文本类型
 */
export declare function normalizeChildren(vnode: any, children: any): void;
export declare function isVNode(value: any): boolean;
export declare function isSameVNodeType(n1: any, n2: any): boolean;
