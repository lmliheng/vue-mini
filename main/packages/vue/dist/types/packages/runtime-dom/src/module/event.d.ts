/**
 * @patchEvent更新DOM中的事件
 */
export declare function patchEvent(el: Element & {
    _vei?: object;
}, rawName: string, prevValue: any, nextValue: any): void;
