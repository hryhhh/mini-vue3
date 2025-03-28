import { ShapeFlags, isString } from "@vue/shared";

export function isSameVnode(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key;
}
//创建虚拟节点对象
export function createVnode(type, props, children) {
  const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0;
  const vnode = {
    __v_isVnode: true,
    type,
    props,
    children,
    el: null,
    key: props?.key, //diff算法需要key
    shapeFlag,
  };
  if (children) {
    if (Array.isArray(children)) {
      vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
    } else {
      children = String(children);
      vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
    }
  }
  return vnode;
}
export function isVnode(value) {
  return value.__v_isVnode;
}