var VueReactivity = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // packages/reactivity/src/index.ts
  var src_exports = {};
  __export(src_exports, {
    effect: () => effect,
    reactive: () => reactive,
    readonly: () => readonly,
    shallowReactive: () => shallowReactive,
    shallowReadonly: () => shallowReadonly
  });

  // packages/shared/src/index.ts
  var isObject = (value) => {
    return typeof value === "object" && value !== null;
  };
  var isArray = Array.isArray;
  var assign = (target, ...argus) => {
    return Object.assign(target, ...argus);
  };
  var isIntegerKey = (key) => {
    return parseInt(key) + "" == key;
  };
  var hasOwn = (target, key) => {
    const hasOwnKey = Object.prototype.hasOwnProperty;
    return hasOwnKey.call(target, key);
  };
  var hasChange = (value, oldValue) => value !== oldValue;

  // packages/reactivity/src/effect.ts
  function effect(fn, options = {}) {
    const effect2 = createEffect(fn, options);
    if (!options.lazy) {
      effect2();
    }
    return effect2;
  }
  var uuid = 0;
  var effectStack = [];
  var activeEffect = null;
  function createEffect(fn, options) {
    const effect2 = function createReactiveEffect() {
      if (!effectStack.includes(effect2)) {
        try {
          effectStack.push(effect2);
          activeEffect = effect2;
          return fn();
        } finally {
          effectStack.pop();
          activeEffect = effectStack[effectStack.length - 1];
        }
      }
    };
    effect2.uuid = uuid++;
    effect2._isEffect = true;
    effect2.raw = effect2;
    effect2.options = options;
    return effect2;
  }
  var targetMap = /* @__PURE__ */ new WeakMap();
  function track(target, type, key) {
    if (!activeEffect) {
      return;
    }
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      dep = /* @__PURE__ */ new Set();
      depsMap.set(key, dep);
    }
    if (!dep.has(activeEffect)) {
      dep.add(activeEffect);
    }
  }
  function trigger(target, type, key, newValue, oldValue) {
    const depsMap = targetMap.get(target);
    if (!depsMap) {
      return;
    }
    const effects = /* @__PURE__ */ new Set();
    const add = (effectsToAdd) => {
      if (effectsToAdd) {
        effectsToAdd.forEach((effect2) => {
          effects.add(effect2);
        });
      }
    };
    if (key === "length" && isArray(target)) {
      depsMap.forEach((dep, key2) => {
        if (typeof key2 != "symbol") {
          if (key2 === "length" || key2 > newValue) {
            add(dep);
          }
        }
      });
    } else {
      if (key !== void 0) {
        add(depsMap.get(target));
      }
      switch (type) {
        case 0 /* ADD */:
          if (isArray(target) && isIntegerKey(key)) {
            add(depsMap.get(target));
          }
          break;
      }
    }
    effects.forEach((effect2) => effect2());
  }

  // packages/reactivity/src/baseHandles.ts
  function createGetter(isShallow = false, isReadonly = false) {
    return function get2(target, key, receiver) {
      let res = Reflect.get(target, key);
      if (!isReadonly) {
        track(target, "get" /* GET */, key);
      }
      if (isShallow) {
        return res;
      }
      if (isObject(res)) {
        return isReadonly ? readonly(res) : reactive(res);
      }
      return res;
    };
  }
  function createSetter(isShallow = false) {
    return function set2(target, key, newValue, receiver) {
      let oldValue = target[key];
      const hadKey = isArray(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key);
      const res = Reflect.set(target, key, newValue, receiver);
      if (!hadKey) {
        trigger(target, 0 /* ADD */, key, newValue);
      } else if (hasChange(newValue, oldValue)) {
        trigger(target, 0 /* ADD */, key, newValue, oldValue);
      }
      return res;
    };
  }
  var get = createGetter();
  var shallowGet = createGetter(true);
  var readonlyGet = createGetter(false, true);
  var shallowReadonlyGet = createGetter(true, true);
  var set = createSetter();
  var shallowSet = createGetter(true);
  var notSet = {
    set: (target, key, newvalue) => {
      console.warn(`not set on ${target} the key '${key}' `);
    }
  };
  var mutableHandlers = {
    get,
    set
  };
  var shallowReactiveHandlers = {
    get: shallowGet,
    set: shallowSet
  };
  var readonlyHandlers = assign({
    get: readonlyGet
  }, notSet);
  var shallowReadonlyHandlers = assign({
    get: shallowReadonlyGet
  }, notSet);

  // packages/reactivity/src/reactive.ts
  var reactiveMap = /* @__PURE__ */ new WeakMap();
  var readonlyMap = /* @__PURE__ */ new WeakMap();
  function createReactiveObject(target, readonly2, baseHandlers) {
    if (!isObject(target)) {
      return target;
    }
    const baseMap = readonly2 ? readonlyMap : reactiveMap;
    if (baseMap.get(target)) {
      return baseMap.get(target);
    }
    let proxy = new Proxy(target, baseHandlers);
    baseMap.set(target, proxy);
    return proxy;
  }
  function reactive(target) {
    return createReactiveObject(target, false, mutableHandlers);
  }
  function shallowReactive(target) {
    return createReactiveObject(target, false, shallowReactiveHandlers);
  }
  function readonly(target) {
    return createReactiveObject(target, true, readonlyHandlers);
  }
  function shallowReadonly(target) {
    return createReactiveObject(target, true, shallowReadonlyHandlers);
  }
  return __toCommonJS(src_exports);
})();
//# sourceMappingURL=reactivity.global.js.map
