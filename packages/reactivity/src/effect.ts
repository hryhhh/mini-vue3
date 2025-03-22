import { DirtyLevels } from "./constants";

export function effect(fn: Function) {
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run(); //若调度器函数被调用，它会再次调用run方法
  });
  _effect.run(); //初始化执行副作用函数

  if (Option) {
    Object.assign(_effect, Option);
  }

  const runner = _effect.run.bind(_effect);
  runner.effect = _effect; //将effect实例绑定到runner函数上
  return runner;
}

export let activeEffect;

//在每次执行副作用前重置依赖长度并增加跟踪 ID
function preCleanEffect(effect) {
  effect._depsLength = 0;
  effect._trackId++;
}
//在每次执行副作用后，清理不再使用的依赖
function postCleanEffect(effect) {
  //检查依赖数组的长度，如果旧的依赖比新依赖多，清理多余的依赖
  if (effect.deps.length > effect._depsLength) {
    for (let i = effect._depsLength; i < effect.deps.length; i++) {
      // 删除映射表对应的effect
      cleanDepEffect(effect.deps[i], effect);
    }
    effect.deps.length = effect._depsLength;
  }
}

export class ReactiveEffect {
  _trackId = 0; //记录当前effect执行了几次，避免重复添加到依赖集合
  deps = []; //存储副作用依赖集合
  _depsLength = 0; //存储依赖集合的长度
  _running = 0; //记录当前effect是否正在运行
  _dirtyLevel = DirtyLevels.Dirty; //脏值标识

  public active = true; //指示该副作用是否处于激活状态

  constructor(public fn, public scheduler?: () => void) {}

  public get dirty() {
    return this._dirtyLevel === DirtyLevels.Dirty;
  }
  public set dirty(value) {
    this._dirtyLevel = value ? DirtyLevels.Dirty : DirtyLevels.NoDirty;
  }
  run() {
    this._dirtyLevel = DirtyLevels.NoDirty; //每次运行后effect为NoDirty
    // console.log("Running effect");
    if (!this.active) {
      return this.fn();
    }
    let lastEffect = activeEffect; //保存上一次的effect
    try {
      activeEffect = this; //将当前的effect实例赋值给全局变量

      preCleanEffect(this); //清除依赖集合
      this._running++;
      return this.fn();
    } finally {
      this._running--;
      postCleanEffect(this); //清除依赖集合
      activeEffect = lastEffect;
    }
  }
  stop() {
    this.active = false;
  }
}
//清理副作用与特定依赖之间的关系
function cleanDepEffect(dep, effect) {
  if (dep) {
    dep.delete(effect);
  }
  // 从副作用的依赖数组中清理旧依赖
  if (effect._depsLength > 0) {
    effect.deps[effect._depsLength--] = undefined;
  }
}
export function trackEffects(effect, dep) {
  if (dep.get(effect) !== effect._trackId) {
    dep.set(effect, effect._trackId);
  }
  // 获取当前副作用的上一个依赖
  let oldDep = effect.deps[effect._depsLength];
  if (oldDep !== dep) {
    if (oldDep) {
      cleanDepEffect(oldDep, effect);
    }
    effect.deps[effect._depsLength++] = dep; //更新当前依赖
  } else {
    effect._depsLength++;
  }
}

export function triggerEffects(dep) {
  for (const effect of dep.keys()) {
    //当前值不脏，但是触发更新需要将值变为脏值
    if (effect._dirtyLevel < DirtyLevels.Dirty) {
      effect._dirtyLevel = DirtyLevels.NoDirty;
    }
    if (!effect._running) {
      if (effect.scheduler) {
        effect.scheduler(); //调用调度器，重新运行副作用
      } else {
        effect.run(); //否则重新运行副作用
      }
    }
  }
}
