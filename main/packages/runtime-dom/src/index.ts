import { createRenderer } from "@vue/runtime-core";
import { extend } from "@vue/shared";
import { nodeOps } from "./nodeOps";
import { patchProp } from "./patchProp";

const RendererOptions = extend({ patchProp }, nodeOps)
let renderer
function ensureRenderer() {
    return renderer || (renderer = createRenderer(RendererOptions))
}

export const render = (...args) => {
    ensureRenderer().render(...args)
}