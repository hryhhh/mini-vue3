//主要对节点元素的增删改查操作

export const nodeOps = {
  insert(el, parent, anchor = null) {
    parent.insertBefore(el, anchor || null);
  },
  remove(el) {
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  },
  createElement(type) {
    return document.createElement(type);
  },
  createText(text) {//创建文本节点
    return document.createTextNode(text);
  },
  setText(node, text) {//设置文本节点
    node.nodeValue = text;
  },
  setElementText(el, text) {//设置元素的文本内容    
    el.textContent = text;
  },
  parentNode(node) {
    return node.parentNode;
  },
  nextSibling(node) {//获取下一个兄弟节点
    return node.nextSibling;
  },
  
};
