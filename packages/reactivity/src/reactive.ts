
import {isObject} from '@my-vue/shared'
import {mutableHandlers,shallowReactiveHandlers,readonlyHandlers,shallowReadonlyHandlers} from './baseHandles'

const reactiveMap = new WeakMap()
const readonlyMap = new WeakMap()
function createReactiveObject(target,readonly,baseHandlers) {
  if(!isObject(target)) {
    return target
  }

  const baseMap = readonly ? readonlyMap : reactiveMap

  if(baseMap.get(target)) {
    return baseMap.get(target)
  }

  let proxy = new Proxy(target,baseHandlers)
  baseMap.set(target,proxy)
  return proxy

}

function reactive(target) {
  return createReactiveObject(target,false,mutableHandlers)
}
function shallowReactive(target) {
  return createReactiveObject(target,false,shallowReactiveHandlers)

} 
function readonly(target) {
  return createReactiveObject(target,true,readonlyHandlers)

} 
function shallowReadonly(target) {
  return createReactiveObject(target,true,shallowReadonlyHandlers)
}
export {
  reactive,
  shallowReactive,
  readonly,
  shallowReadonly
}