/**
 * 根据虚拟DOM创建组件实例
 */
export declare function createComponentInstance(vnode: any): {
    uid: number;
    vnode: any;
    type: any;
    subTree: never;
    effect: never;
    update: never;
    render: never;
    isMounted: boolean;
    bc: null;
    c: null;
    bm: null;
    m: null;
};
/**
 * 规范化组件实例数据
 * 这有什么用?把type里的render函数赋给了instance的render属性
 */
export declare function setupComponent(instance: any): void;
export declare function handleSetResult(instance: any, setupResult: any): void;
