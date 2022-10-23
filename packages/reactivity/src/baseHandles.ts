
import { assign, isObject,isArray,isIntegerKey,hasOwn,hasChange } from '@my-vue/shared'
import { readonly, reactive } from './reactive'
import { TrackType,TriggerOrTypes } from "./operations"
import { track,trigger } from './effect'

/**
 * 当前目标也就是代理对象
 * @param isShallow 是否是浅的
 * @param isReadonly 是否是可读的
 * @returns 返回代理后的对象
 */
function createGetter(isShallow = false, isReadonly = false) {
  // 返回的get函数默认接收三个参数，代理的对象  读取当前的key 
  return function get(target, key, receiver) {
    
    let res = Reflect.get(target, key) // 直接从Reflect.get 拿取，相当于冲Object.defineProperty的get
    if (!isReadonly) { // 判断是否是只读的，如果是收集依赖
      // 收集依赖...
      // 收集依赖，调用track函数，传入当前目标对象，类型，以及当前读取对象的key
      track(target, TrackType.GET, key)
    }
    // 判断是否是浅的，如果是直接返回目标对象
    if (isShallow) {
      return res
    }
    // 再去判断值是否是对象，如果是，判断是否是只读的，是的代理值（只读），否则代理值（响应式）
    // Vue3的响应式和Vue2的不同，Vue2是一上来就递归代理，Vue3是属于懒代理，读取到之后再进行代理，节约一定性能
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }
    // 最后将结果返回
    return res
  }
}




function createSetter(isShallow = false) {
  // 设置值
  return function set(target, key, newValue, receiver) {
    let oldValue = target[key] // 获取老值，之后要用
    // 判断是否是修改
      // 判断是数组，且改的key为索引也就是整数，再判断要修改的索引是否小于数组的长度
      // 如果不是数组，那就是对象，判断要修改的key是否再目标对象上
    const hadKey = isArray(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target,key)
    
    const res = Reflect.set(target, key, newValue, receiver)
    if(!hadKey) { 
      // 新增调用对应的回调函数 传入参数
      trigger(target,TriggerOrTypes.ADD,key,newValue)
    } else if(hasChange(newValue,oldValue)){ // 判断修改前后的值是否相同，如果不同就是修改
      trigger(target,TriggerOrTypes.ADD,key,newValue,oldValue)
    }
    // 我们要区分是新增还是修改的 Vue2里边无法监控数组索引和length的变化
    
    // 数据发生变化  重新执行effect收集的函数
    return res
  }
}
const get = createGetter()
const shallowGet = createGetter(true)
const readonlyGet = createGetter(false, true)
const shallowReadonlyGet = createGetter(true, true)
const set = createSetter()
const shallowSet = createGetter(true)

const notSet = {
  set: (target, key, newvalue) => {
    console.warn(`not set on ${target} the key '${key}' `)
  }
}


// 根据不同的参数，做出对应的set和getter
const mutableHandlers = {
  get,
  set
}
const shallowReactiveHandlers = {
  get: shallowGet,
  set: shallowSet
}

const readonlyHandlers = assign({
  get: readonlyGet,
}, notSet)
const shallowReadonlyHandlers = assign({
  get: shallowReadonlyGet,
}, notSet)

export { mutableHandlers, shallowReactiveHandlers, readonlyHandlers, shallowReadonlyHandlers }