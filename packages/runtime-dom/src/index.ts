import { nodeOps } from "./nodeOps";
import patchProp from "./patchProp";

import { createRenderer } from "@vue/runtime-core";
//将nodeOps和patchProp合并到renderOptions中
const renderOptions = Object.assign({ patchProp }, nodeOps);

export const render = (vnode, container) => {
  return createRenderer(renderOptions).render(vnode, container);
};

export { renderOptions }; // 确保 renderOptions 导出

export * from "@vue/runtime-core";
