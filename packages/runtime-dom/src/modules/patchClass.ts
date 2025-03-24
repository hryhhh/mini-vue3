
export function patchClass(el, value) {
  //设置元素的class属性
  if (value == null) {
    value = "";
  }
  el.className = value;
}