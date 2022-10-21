
import { assign, isObject } from '@my-vue/shared'
import { readonly, reactive } from './reactive'
import { TrackType } from "./operations"
import { track } from './effect'

function createGetter(isShallow = false, isReadonly = false) {
  return function get(target, key, receiver) {
    let res = Reflect.get(target, key)
    if (!isReadonly) {
      // 收集依赖...
      console.log('收集依赖...', key);
      track(target, TrackType.GET, key)
    }

    if (isShallow) {
      return res
    }

    if (isObject(res)) {
      isReadonly ? readonly(res) : reactive(res)
    }
    return res
  }
}




function createSetter(isShallow = false) {
  return function set(target, key, newValue, receiver) {
    const res = Reflect.set(target, key, newValue, receiver)
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