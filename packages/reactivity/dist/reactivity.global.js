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

  // packages/reactivity/src/handlers.ts
  function createHandlerGet(shallow = false, isReadonly = false) {
    return function get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver);
      if (!isReadonly) {
        console.log("\u6536\u96C6\u4F9D\u8D56....");
      }
      if (shallow) {
        return res;
      }
      if (isObject(res)) {
        return isReadonly ? readonly(res) : reactive(res);
      }
      return res;
    };
  }
  function createHandlerSet(shallow = false) {
    return function set(target, key, value, receiver) {
      const res = Reflect.set(target, key, value, receiver);
      return res;
    };
  }
  var mutableHandlers = {
    get: createHandlerGet(),
    set: createHandlerSet()
  };
  var shallowMutableHandlers = {
    get: createHandlerGet(true),
    set: createHandlerSet(true)
  };
  var readonlyHandlers = {
    get: createHandlerGet(false, true),
    set(target, key, value, receiver) {
      console.warn(`set ${target} on the ${key} fail`);
    }
  };
  var shallowReadonlyHandlers = {
    get: createHandlerGet(true, true),
    set(target, key, value, receiver) {
      console.warn(`set ${target} on the ${key} fail`);
    }
  };

  // packages/reactivity/src/index.ts
  var readonlyMap = /* @__PURE__ */ new WeakMap();
  var reactiveMap = /* @__PURE__ */ new WeakMap();
  function createReactiveObject(target, isReadonly = false, baseHandlers) {
    if (!isObject(target)) {
      return target;
    }
    const baseMap = isReadonly ? readonlyMap : reactiveMap;
    if (baseMap.get(target))
      return baseMap.get(target);
    const proxyTarget = new Proxy(target, baseHandlers);
    baseMap.set(target, proxyTarget);
    return proxyTarget;
  }
  function reactive(target) {
    return createReactiveObject(target, false, mutableHandlers);
  }
  function shallowReactive(target) {
    return createReactiveObject(target, false, shallowMutableHandlers);
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
