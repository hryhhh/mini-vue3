import { ShapeFlags } from "@vue/shared";
import { Fragment, Text, isSameVnode } from "./createVnode";
import getSequence from "../seq";

//创建一个渲染器，用于将虚拟 DOM 节点渲染到真实 DOM 容器中
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
  const mountElement = (vnode, container, anchor) => {
    const { type, props, children, shapeFlag } = vnode;

    // console.log(type, props, children);
    let el = (vnode.el = hostCreateElement(type)); //关联虚拟节点和真实节点

    if (props) {
      for (let key in props) {
        //设置元素属性
        hostPatchProp(el, key, null, props[key]);
      }
    }
    //9 & 8 >0 说明子节点是文本节点
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children);
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el);
    }

    hostInsert(el, container, anchor); //将真实 DOM 元素插入到容器中
  };
 

  //根据旧虚拟节点是否存在，决定挂载新元素还是更新现有元素
  const processElement = (n1, n2, container, anchor = null) => {
    //初始化操作：n1不存在，n2存在，挂载n2
    if (n1 == null) {
      mountElement(n2, container, anchor); //挂载新元素
    } else {
      patchElement(n1, n2, container); //更新元素
    }
  };
  //更新或删除元素的属性
  const patchProps = (oldProps, newProps, el) => {
    for (let key in newProps) {
      hostPatchProp(el, key, newProps[key], newProps[key]);
    }

    for (let key in oldProps) {
      if (!(key in newProps)) {
        hostPatchProp(el, key, oldProps[key], null); //删除属性
      }
    }
  };
  const unmountChildren = (children) => {
    for (let i = 0; i < children.length; i++) {
      unmount(children[i]);
    }
  };

  //全量diff（递归diff 性能差）
  const patchKeyedChildren = (c1, c2, el) => {
    let i = 0;
    let e1 = c1.length - 1; //c1数组的尾部索引
    let e2 = c2.length - 1; //c2数组的尾部索引

    //从头部比较
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSameVnode(n1, n2)) {
        patch(n1, n2, el); //递归比较子节点
      } else {
        break;
      }
      i++;
    }

    //从尾部比较
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      if (isSameVnode(n1, n2)) {
        patch(n1, n2, el);
      } else {
        break;
      }
      e1--;
      e2--;
    }

    //特殊插入和删除：处理新节点比旧节点多或少的情况
    if (i > e1) {
      if (i <= e2) {
        //有插入的部分
        let nextPos = e2 + 1; //新节点数组中最后一个节点的下一个位置
        let anchor = c2[nextPos]?.el; //插入新节点的参考位置

        while (i <= e2) {
          patch(null, c2[i], el, anchor);
          i++;
        }
      }
    } else if (i > e2) {
      //处理移除节点
      if (i <= e1) {
        while (i <= e1) {
          unmount(c1[i]);
          i++;
        }
      }
    }
    //乱序的情况
    let s1 = i;
    let s2 = i;

    const keyToNewIndexMap = new Map(); //记录新节点的位置
    let toBePatched = e2 - s2 + 1; //新数组中未处理的节点数量

    //记录新节点在旧节点数组 c1 中的对应位置
    let newIndexToOldIndexMap = new Array(toBePatched).fill(0);

    //构建新节点的映射表
    for (let i = s2; i <= e2; i++) {
      const vnode = c2[i];
      keyToNewIndexMap.set(vnode.key, i); //key:index
    }

    //遍历旧节点数组 c1 中未处理的部分
    for (let i = s1; i <= e1; i++) {
      const vnode = c1[i];
      const newIndex = keyToNewIndexMap.get(vnode.key); //新的位置;

      if (newIndex === undefined) {
        unmount(vnode);
      } else {
        // 存在，说明该旧节点可以复用
        newIndexToOldIndexMap[newIndex - s2] = i + 1;
        patch(vnode, c2[newIndex], el); //复用
      }
    }
    //调整顺序 最长递增子序列：寻找不需要移动的节点，减少 DOM 操作
    let increaseingSeq = getSequence(newIndexToOldIndexMap);

    let j = increaseingSeq.length - 1;

    //倒序遍历新节点
    for (let i = toBePatched - 1; i >= 0; i--) {
      let nextIndex = s2 + i; //当前节点在新数组中的索引
      let vnode = c2[nextIndex];
      let anchor = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : null;
      if (!vnode.el) {
        patch(null, vnode, el, anchor); //创建并插入
      } else {
        if (i === increaseingSeq[j]) {
          j--; //做了diff算法的优化
        } else {
          hostInsert(vnode.el, el, anchor); //接着倒序插入
        }
      }
    }
  };
  const patchChildren = (n1, n2, el) => {
    //text, array, null
    const c1 = n1.children;
    const c2 = n2.children;
    const prevShapeFlag = n1.shapeFlag;
    const shapeFlag = n2.shapeFlag;

    //1,新的是文本，老的是数组移除老的
    //2,新的是文本，老的也是文本，内容不相同替换
    //3.老的是数组，新的是数组，全量diff算法
    //4,老的是数组，新的不是数组，移除老的子节点
    //5,老的是文本，新的是空
    //6.老的是文本，新的是数组

    //1.新子节点是文本
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      //旧子节点是数组，卸载旧子节点
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1);
      }
      //新旧子节点都是文本，比较文本是否相同
      if (c1 !== c2) {
        hostSetElementText(el, c2);
      }
    } else {
      //旧子节点是数组
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        //新子节点也是数组，diff算法
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          patchKeyedChildren(c1, c2, el);
        } else {
          //新子节点不是数组，直接删除旧子节点
          unmountChildren(c1);
        }
      } else {
        //旧子节点是文本，新子节点是数组，直接删除文本
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(el, "");
        }
        //新子节点是数组，挂载新子节点
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          mountChildren(c2, el);
        }
      }
    }
  };

  //更新现有元素的属性和子节点
  const patchElement = (n1, n2, container) => {
    let el = (n2.el = n1.el); //对dom元素的复用

    let oldProps = n1.props || {};
    let newProps = n2.props || {};

    patchProps(oldProps, newProps, el); //更新属性
    patchChildren(n1, n2, el); //更新子节点
  };

  //处理文本节点的挂载或更新
  const processText = (n1, n2, container) => {
    if (n1 == null) {
      hostInsert((n2.el = hostCreateText(n2.children, container)), container);
    } else {
      const el = (n2.el = n1.el);
      if (n1.children !== n2.children) {
        hostSetText(el, n2.children);
      }
    }
  };

  //处理 Fragment 节点的挂载或更新
  const processFragment = (n1, n2, container) => {
    if (n1 === null) {
      mountChildren(n2.children, container);
    } else {
      patchChildren(n1, n2, container);
    }
  };
  //diff比较新旧虚拟节点,根据情况更新 DOM
  const patch = (n1, n2, container, anchor = null) => {
    if (n1 === n2) {
      return;
    }
    //n1存在且新旧节点类型不同，卸载旧节点
    if (n1 && !isSameVnode(n1, n2)) {
      unmount(n1);
      n1 = null; //卸载n1，接着执行后面n2的初始化
    }

    const { type } = n2;
    switch (type) {
      case Text:
        processText(n1, n2, container);
        break;
      case Fragment:
        processFragment(n1, n2, container);
        break;
      default:
        processElement(n1, n2, container, anchor); //处理元素的挂载或更新
    }
  };

  const unmount = (vnode) => {
    if (vnode.type === Fragment) {
      unmountChildren(vnode.children);
    } else {
      hostRemove(vnode.el);
    }
  };
  //虚拟节点 vnode 渲染到真实的 DOM 容器 container 中
  const render = (vnode, container) => {
    if (vnode == null) {
      if (container._vnode) {
        unmount(container._vnode);
      }
    } else {
      patch(container._vnode || null, vnode, container);
      container._vnode = vnode;
    }
  };
  return {
    render,
  };
}
