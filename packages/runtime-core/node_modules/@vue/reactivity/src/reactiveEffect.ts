import { activeEffect } from "./effect";
import { trackEffects } from "./effect";
import { triggerEffects } from "./effect";

const targetMap = new WeakMap();

export const createDep = (cleanup, key) => {
  const dep = new Map() as any;
  dep.cleanup = cleanup;
  dep.name = key;
  return dep;
};

//在副作用函数执行时，追踪其对数据属性的依赖
export function track(target, key) {
  
  //只有在有副作用函数运行时，才进行依赖追踪
  if (activeEffect) {
    //depsMap: Map 对象，用于存储对象的依赖映射关系
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()));
    }

    //deps: Map 对象，用于存储属性对应的副作用函数集合
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, (dep = createDep(() => depsMap.delete(key), key)));
    }

    trackEffects(activeEffect, dep);
    
  }
}

//在数据变化时触发相应的副作用函数
export function trigger(target, key, newValue, oldValue) {
    const depsMap = targetMap.get(target)
    if (!depsMap) {
        return
    }
    let dep = depsMap.get(key);
    if (dep) {
        triggerEffects(dep);
    }
    
}
//Map:{obj:{
// name:{[effect,effect]},
// age:{[effect,effect]}
// }}
