/**
 * @render 渲染函数
 */
export interface RendererOptions {
    /**
     * 更新dom中属性部分
     */
    patchProp(el: Element, key: string, prevValue: any, nextValue: any): void;
    /**
     * 更新标签文本
     */
    setElementText(node: Element, text: string): void;
    /**
     * 创建标签，或者叫元素
     */
    createElement(type: string): any;
    /**
     * 插入到dom树中
     */
    insert(el: any, parent: Element, anchor?: any): void;
    remove(el: any): void;
}
/**
 * Render主逻辑
 */
export declare function createRenderer(option: RendererOptions): {
    render: (vnode: any, container: any) => void;
};
