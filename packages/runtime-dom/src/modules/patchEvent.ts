export function patchEvent(el, name, nextValue) {
  const invokers = el._vei || (el._vei = {}); //创建事件缓存区
  const eventName = name.slice(2).toLowerCase();

  let existingInvoker = invokers[name];
  //新旧值都有，事件换绑
  if (nextValue && existingInvoker) {
    return (existingInvoker.value = nextValue);
  }
  //新值有，旧值没有，创建新的事件绑定
  if (nextValue) {
    const invoker = (invokers[name] = createInvoker(nextValue));
    return el.addEventListener(eventName, invoker);
  }
  //新值没有，旧值有，删除事件绑定
  if (existingInvoker) {
    el.removeEventListener(eventName, existingInvoker);
    invokers[name] = undefined;
  }
}
function createInvoker(value) {
  //创建一个事件调用器，动态更新事件处理函数
  const invoker = (e) => invoker.value(e);
  invoker.value = value;
  return invoker;
}
