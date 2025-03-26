import { isFunction } from "@vue/shared";
import { ReactiveEffect, triggerEffects } from "./effect";
import { trackRefValue } from "./ref";

class ComputedRefImpl {
  public _value;
  public effect;
  public dep = new Set();
  constructor(getter, public setter) {
    this.effect = new ReactiveEffect(
      () => getter(),
      () => {
        // 依赖更新时触发渲染effect重新执行
        triggerEffects(this.dep); //
      }
    );
  }
  get value() {
    if (this.effect.dirty) {
      //默认取值是脏的，执行一次run方法后就不脏了
      this._value = this.effect.run();
      trackRefValue(this);
    }
    return this._value;
  }
  set value(value) {
    this.setter(value);
  }
}
export function computed(getterOrOptions) {
  //判断传入的参数是一个 getter 函数，还是一个包含 getter 和 setter 的对象
  let onlyGetter = isFunction(getterOrOptions);
  let getter;
  let setter;
  if (onlyGetter) {
    //是函数
    getter = getterOrOptions;
    setter = () => {};
  } else {
    //是对象
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  return new ComputedRefImpl(getter, setter);
}
