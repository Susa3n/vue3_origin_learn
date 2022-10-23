
import {isObject} from '@my-vue/shared'
import {mutableHandlers,shallowReactiveHandlers,readonlyHandlers,shallowReadonlyHandlers} from './baseHandles'

const reactiveMap = new WeakMap()
const readonlyMap = new WeakMap()
/**
 * 
 * @param target 代理的目标对象
 * @param readonly 是否是只读的，根据是否可读创建两个weakmap对象，将代理过的对象存进入，如果再次代理，判断是否代理过 如果是直接返回
 * @param baseHandlers 对应的处理对象get 和 set
 * @returns 返回代理后的对象
 */
function createReactiveObject(target,readonly,baseHandlers) {
  if(!isObject(target)) { // 判断代理对象是否是对象类型，如果不是直接返回
    return target
  }
  // 根据参数判断是否是可读的，拿到对应的map对象
  const baseMap = readonly ? readonlyMap : reactiveMap 
  // 判断map对象中是否有当前代理的目标对象，如果有直接返回
  if(baseMap.get(target)) {
    return baseMap.get(target)
  }
  // 通过new Proxy传入代理对象和配置对象
  let proxy = new Proxy(target,baseHandlers)
  baseMap.set(target,proxy) // 将代理过的对象存到map中
  return proxy
}

function reactive(target) { // 响应式数据
  return createReactiveObject(target,false,mutableHandlers)
}
function shallowReactive(target) { // 浅响应式数据
  return createReactiveObject(target,false,shallowReactiveHandlers)

} 
function readonly(target) { // 只读数据
  return createReactiveObject(target,true,readonlyHandlers)

} 
function shallowReadonly(target) { // 浅的只读数据
  return createReactiveObject(target,true,shallowReadonlyHandlers)
}
export {
  reactive,
  shallowReactive,
  readonly,
  shallowReadonly
}