import { ShapeFlags } from "@vue/shared";

export function createRenderer(renderOptions) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    createElement: hostCreateElement,
    createText: hostCreateText,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    patchProp: hostPatchProp,
  } = renderOptions;

  const mountChildren = (children, container) => {
    for (let i = 0; i < children.length; i++) {
      patch(null, children[i], container);
    }
  };
  //将虚拟节点vnode挂载到 DOM 中
  const mountElement = (vnode, container) => {
    const { type, props, children, shapeFlag } = vnode;

    // console.log(type, props, children);
    let el = hostCreateElement(type);

    if (props) {
      for (let key in props) {
        //更新元素属性
        hostPatchProp(el, key, null, props[key]);
      }
    }
    //9 & 8 >0 说明子节点是文本节点
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children);
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el);
    }

    hostInsert(el, container);
  };
  //比较新旧虚拟节点,根据情况更新 DOM
  const patch = (n1, n2, container) => {
    if (n1 === n2) {
      return;
    }
    //n1不存在，n2存在，挂载n2
    if (n1 === null) {
      mountElement(n2, container);
    }
  };
  //虚拟节点 vnode 渲染到真实的 DOM 容器 container 中
  const render = (vnode, container) => {
    patch(container._vnode || null, vnode, container);

    container._vnode = vnode;
  };
  return {
    render,
  };
}
