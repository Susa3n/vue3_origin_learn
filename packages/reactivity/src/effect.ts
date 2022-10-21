export function effect(fn,options:any = {}) {

  const effect = createEffect(fn,options)
  if(!options.lazy) {
    effect()
  }

  return effect
}

let uuid = 0
const effectStack = []
let activeEffect = null
function createEffect(fn,options) {
  const effect = function createReactiveEffect() {
    if(!effectStack.includes(effect)) {
      try {
        effectStack.push(effect)
        activeEffect = effect
        return fn()
      } finally {
        effectStack.pop()
        activeEffect = effectStack[effectStack.length-1]
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
export function track(target,type,key) {
  if(!activeEffect) {
    return
  }

  let depsMap = targetMap.get(target) 
  if(!depsMap) {
    depsMap = targetMap.set(target,new Map())
  }
  let dep = depsMap.get(key)
  if(!dep) {
    depsMap.set(key,(dep = new Set()))
  }
  if(!dep.has(activeEffect)) {
    dep.add(activeEffect)
  }


}