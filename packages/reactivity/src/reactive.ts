import { isObject } from "@vue/shared";
import { mutableHandlers, ReactiveFlags } from "./baseHandler";
const reactiveMap = new WeakMap(); //存储已经创建的代理对象

//检查target类型，响应式状态以及是否存在代理
function createReactiveObject(target: any) {
  //创建响应式对象
  //先判断target是否是对象
  if (!isObject(target)) {
    return target;
  }

  //判断target是否已经是响应式的
  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target;
  }

  // 代理对象被多次代理，可以直接返回
  let existingProxy = reactiveMap.get(target);
  if (existingProxy) {
    return existingProxy;
  } else {
    reactiveMap.set(target, new Proxy(target, mutableHandlers)); // 修复设置代理对象的逻辑
  }
  return reactiveMap.get(target); // 返回代理对象
}
//创建响应式对象
export function reactive(target: any) {
  return createReactiveObject(target);
}

//将给定的值转换为响应式对象
export function toReactive(value) {
  return isObject(value) ? reactive(value) : value;
}
