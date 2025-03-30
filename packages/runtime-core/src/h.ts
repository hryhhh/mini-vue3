import { createVnode, isVnode } from "./createVnode";
import { isObject } from "@vue/shared";

//h(hyperscript函数): 用来创建虚拟节点
//type:标签名(字符串)或者组件
//propsOrChildren:节点属性或者子节点
//children:子节点
export function h(type, propsOrChildren?, children?) {
  let l = arguments.length;
  if (l === 2) {
    //两个参数的情况
    if (isObject(propsOrChildren) && !Array.isArray(propsOrChildren)) {
      if (isVnode(propsOrChildren)) {
        //h('div',h('p'))嵌套虚拟节点
        return createVnode(type, null, [propsOrChildren]);
      } else {
        return createVnode(type, null, propsOrChildren);
      }
    }
    return createVnode(type, null, propsOrChildren);
  } else {
    //第三个参数开始的所有参数转换为数组，并赋值给 children
    if (l > 3) {
      children = Array.from(arguments).slice(2);
    }
    if (l == 3 && isVnode(children)) {
      children = [children];
    }
    return createVnode(type, propsOrChildren, children);
  }
}
