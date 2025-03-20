import { track } from "./reactiveEffect";
import { trigger } from "./reactiveEffect";
import { reactive } from "./reactive";
import { isObject } from "@vue/shared";
import { activeEffect } from "./effect";

export enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
}
export const mutableHandlers: ProxyHandler<object> = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      //判断是否是响应式的
      return true;
    }
    //依赖收集
    track(target, key);
    // console.log(activeEffect, key);

    let res = Reflect.get(target, key, receiver);
    if (isObject(res)) {
      //当取的值也是对象,递归代理
      return reactive(res);
    }
    return res; // 添加返回值
  },
  set(target, key, value, receiver) {
    //判断值是否发生改变

    let oldValue = target[key];

    let result = Reflect.set(target, key, value, receiver);

    if (oldValue !== value) {
      //触发页面更新
      trigger(target, key, value, oldValue);
    }

    //触发依赖更新
    return result;
  },
};
