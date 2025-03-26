import { activeEffect, trackEffects, triggerEffects } from "./effect";
import { toReactive } from "./reactive";
import { createDep } from "./reactiveEffect";

export function ref(value) {
  return createRef(value);
}

function createRef(value) {
  return new RefImpl(value);
}
class RefImpl {
  public __v_isRef = true; //标识符，表明该对象是一个响应式引用
  public _value; //存储响应式值的属性
  public dep; //存储与该引用相关的依赖集合
  constructor(public rawValue) {
    this._value = toReactive(rawValue);
  }
  get value() {
    trackRefValue(this);
    return this._value;
  }
  set value(newValue) {
    if (newValue !== this.rawValue) {
      this.rawValue = newValue;
      this._value = newValue;
      triggerRefValue(this);
    }
  }
}
export function trackRefValue(ref) {
  if (activeEffect) {
    trackEffects(
      activeEffect,
      (ref.dep = ref.dep|| createDep(() => (ref.dep = undefined), "undefined"))
    );
  }
}

function triggerRefValue(ref) {
  let dep = ref.dep;
  if (dep) {
    triggerEffects(dep); //触发依赖更新
  }
}

//toRef,toRefs

class ObjectRefImpl {
  public __v_isRef = true;
  constructor(public _object, public _key) {}
  get value() {
    return this._object[this._key];
  }
  set value(newValue) {
    this._object[this._key] = newValue;
  }
}
export function toRef(target, key) {
  return new ObjectRefImpl(target, key);
}

export function toRefs(object) {
  //遍历对象的属性，将每个属性转换为一个响应式引用
  const res = {};
  for (let key in object) {
    res[key] = toRef(object, key);
  }
  return res;
}

export function proxyRefs(objectWithRef) {
  return new Proxy(objectWithRef, {
    get(target, key, receiver) {
      let r = Reflect.get(target, key, receiver);
      return r.__v_isRef ? r.value : r;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      if (oldValue.__v_isRef) {
        oldValue.value = value;
        return true;
      } else {
        return Reflect.set(target, key, value, receiver);
      }
    },
  });
}

export function isRef(value) {
  return value && value.__v_isRef;
}
