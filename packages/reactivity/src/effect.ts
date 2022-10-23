import { isArray, isIntegerKey } from "@my-vue/shared"
import { TriggerOrTypes } from "./operations"
/**
 * 
 * @param fn 回调函数
 * @param options 配置对象
 * @returns 返回effect函数
 */
export function effect(fn, options: any = {}) {
  // 创建副作用函数，传入回调函数和配置对象
  const effect = createEffect(fn, options)
  // 根据配置对象lazy属性是否是延迟的,如果不是直接调用
  if (!options.lazy) {
    effect()
  }

  return effect
}

let uuid = 0 // 每个副作用函数都有一个单独的id
// effectStack的作用，是一个栈，收集副作用函数，主要作用：如果在一个副作用函数再嵌套一个副作用函数
// 内层副作用函数用到的属性收集完毕后，将activeEffect置为null。但是外层副作用函数还有可能有属性要收集外层的副作用函数
// 所以要维护一个栈的结构，如果内层副作用函数收集完毕后，将栈中的最后一个函数移除（pop），且将activeEffect置为栈中的最后一个函数
const effectStack = []
// activeEffect这个关键字类似vue2中的Dep.target，代表当前的副作用函数
// 先设置当前副作用函数，再调用，在副作用函数中用到的属性，当读取属性时，属性可以收集关联的函数，之后属性发生变化通知关联的函数重新执行
let activeEffect = null

function createEffect(fn, options) {
  // 创建响应式副作用函数
  const effect = function createReactiveEffect() {
    // 判断栈中是否有这个副作用函数，如果没有进行收集
    if (!effectStack.includes(effect)) {
      try {
        // 将当前副作用函数添加（push）到栈中
        effectStack.push(effect)
        //将当前副作用函数设置为activeEffect
        activeEffect = effect
        // 执行用户传入的回调函数，会触发属性的依赖收集，调用tract函数
        return fn()
      }
      finally {
        effectStack.pop()
        activeEffect = effectStack[effectStack.length - 1]
      }
    }
  }
  effect.uuid = uuid++
  effect._isEffect = true
  effect.raw = effect
  effect.options = options
  return effect
}
const targetMap = new WeakMap()
/**
 * 
 * @param target 收集依赖的目标对象
 * @param type 类型
 * @param key 当前的key
 * @returns 
 */
export function track(target, type, key) {
  // 如果当前没有副作用函数 直接返回
  if (!activeEffect) {
    return
  }
  // 创建一个weakmap对象。用于收集代理的目标对象
  // 首先判断有没有，如果没有创建一个，key是当前目标对象 值是一个map对象
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, depsMap = new Map)
  }
  // 再通过key判断map对象中是已经收集过
  let dep = depsMap.get(key)
  // 如果没有，创建一个set的实例，
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }

  // 再去判断是否有当前副作用函数，如果有进行收集

  if (!dep.has(activeEffect)) {
    dep.add(activeEffect)
  }
}


export function trigger(target, type, key?, newValue?, oldValue?) {
  // console.log(target,type,key,value,oldValue);
  // 如果这个属性没有收集过副作用函数 直接return 不做什么
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }

  // 需要该属性收集过的所有副作用函数，放到一起统一执行
  const effects = new Set()
  const add = (effectsToAdd) => { 
    if(effectsToAdd) {
      effectsToAdd.forEach(effect => {
        effects.add(effect)
      });
    }
  }
  // 1.看修改的是数组的长度的话 因为改长度影响比较大 进行收集,并且值必须小于旧数组的长度
  if (key === 'length' && isArray(target)) {
    depsMap.forEach((dep, key) => {
      if (typeof key != 'symbol') {
        if (key === 'length' || key > newValue) {
          add(dep)
        }
      }
    });
  }else {
    // 可能是对象
    if(key !== undefined) {
      add(depsMap.get(target))
    }

    // 如果修改的是索引
    switch (type) { // 如果新添加的是一个索引
      case TriggerOrTypes.ADD:
        if(isArray(target) && isIntegerKey(key)) {
          add(depsMap.get(target))
        }
        break;
    }
  }
  effects.forEach((effect:any) =>effect());
}