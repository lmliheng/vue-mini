import { createRenderer } from "@vue/runtime-core";
import { extend } from "@vue/shared";
import { nodeOps } from "./nodeOps";
import { patchProp } from "./patchProp";


/**
 * @首次调用并缓存，后续使用避免再次创建
 * 使用nodeops和patch可以实现平台迁移，如小程序，webGL等
 */
const RendererOptions = extend({ patchProp }, nodeOps)
let renderer
function ensureRenderer() {
    return renderer || (renderer = createRenderer(RendererOptions))
}

export const render = (...args) => {
    ensureRenderer().render(...args)
}