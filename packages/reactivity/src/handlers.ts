// 每个handlers都有对应的get和set，进行处理
import { isObject } from '@my-vue/shared'
import {reactive,readonly} from './index'
function createHandlerGet(shallow = false,isReadonly = false) {
  return function get(target,key,receiver) {
    const res = Reflect.get(target,key,receiver)
    if(!isReadonly) {
      // 收集依赖...
      console.log('收集依赖....');
    }
    if(shallow) {
      return res
    }
    if(isObject(res)) {
       return isReadonly ? readonly(res) : reactive(res)
    }
    return res
  }
}

function createHandlerSet(shallow = false) {
  return function set(target,key,value,receiver) {
    const res = Reflect.set(target,key,value,receiver)
    return res
  }
}

export let mutableHandlers = {
  get:createHandlerGet(),
  set:createHandlerSet()
}

export let shallowMutableHandlers = {
  get:createHandlerGet(true),
  set:createHandlerSet(true)
}

export let readonlyHandlers = {
  get:createHandlerGet(false,true),
  set(target,key,value,receiver) {
    console.warn(`set ${target} on the ${key} fail`);
  }
}
export let shallowReadonlyHandlers = {
  get:createHandlerGet(true,true),
  set(target,key,value,receiver) {
    console.warn(`set ${target} on the ${key} fail`);
  }
}