import { isReactive } from "./reactive";
import { ReactiveEffect } from "./effect";
import { isFunction, isObject } from "@vue/shared";
import { isRef } from "./ref";

//递归遍历一个对象，以触发对象的所有属性的响应式依赖收集
function traverse(source, depth, currentDepth = 0, seen = new Set()) {
  if (!isObject(source)) {
    return source;
  }
  if (depth) {
    if (currentDepth >= depth) {
      return source;
    }
    currentDepth++;
  }
  if (seen.has(source)) {
    return source;
  }
  seen.add(source);
  for (let key in source) {
    traverse(source[key], depth, currentDepth, seen);
  }
  return source;
}

//具体实现 watch 功能，创建一个响应式的副作用函数，并在数据源发生变化时执行回调函数
function doWatch(source, cb, { deep, immediate }) {
  const reactiveGetter = (source) =>
    traverse(source, deep === false ? 1 : undefined);
  let getter;
  if (isReactive(source)) {
    getter = () => reactiveGetter(source);
  } else if (isRef(source)) {
    getter = () => source.value;
  } else if (isFunction(source)) {
    getter = source;
  }
    let oldValue;
    let clean;
    const onCleanup = (fn) => {
        clean = () => {
            fn();
            clean = undefined;
        }
    }
    const job = () => {
    //当副作用函数执行时，会重新计算新值，与旧值进行比较，然后执行用户的回调函数
    if (cb) {
        const newValue = effect.run();
        if (clean) {
            clean();
        }
      cb(newValue, oldValue,onCleanup);
      oldValue = newValue;
    } else {//watchEffect
      effect.run();
    }
  };

  const effect = new ReactiveEffect(getter, job);
  if (cb) {
    if (immediate) {
      //立即先执行一次用户的回调函数
      job();
    } else {
      oldValue = effect.run();
    }
  } else {
    //watchEffect不需要回调函数，直接执行effect.run
    effect.run();
    }
    
    const unwatch = () => {
    effect.stop();
    }
    return unwatch;
}
export function watch(source, cb, options = {} as any) {
  //watchEffect也是基于doWatch实现的
  return doWatch(source, cb, options);
}
export function watchEffect(source) {
  return doWatch(source, null, {} as any);
}
