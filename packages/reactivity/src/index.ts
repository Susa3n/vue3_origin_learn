import { isObject } from '@my-vue/shared'
import { mutableHandlers, shallowMutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from './handlers'


// 设置两个weakMap对象，用来保存已经代理过的数据
const readonlyMap = new WeakMap()
const reactiveMap = new WeakMap()
function createReactiveObject(target, isReadonly = false, baseHandlers) {
  // 判断是否是个对象,如果不是直接返回
  if (!isObject(target)) {
    return target
  }
  const baseMap = isReadonly ? readonlyMap : reactiveMap // 判断是否只读
  if (baseMap.get(target)) return baseMap.get(target) // 根据类型进行查找 判断是否代理过，如果是直接返回
  // 没有的话进入下一步
  const proxyTarget = new Proxy(target, baseHandlers)
  baseMap.set(target, proxyTarget)
  return proxyTarget
}
// 普通响应式对象
function reactive(target) {
  return createReactiveObject(target, false, mutableHandlers)
}
// 浅的响应式对象
function shallowReactive(target) {
  return createReactiveObject(target, false, shallowMutableHandlers)

}
// 只读对象
function readonly(target) {
  return createReactiveObject(target, true, readonlyHandlers)

}
// 浅的只读对象
function shallowReadonly(target) {
  return createReactiveObject(target, true, shallowReadonlyHandlers)

}


export {reactive,shallowReactive,readonly,shallowReadonly}