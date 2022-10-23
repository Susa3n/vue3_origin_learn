// src/index.ts
/**
 * 判断对象
 */
export const isObject = (value) => {
  return typeof value === 'object' && value !== null
}
/**
 * 判断函数
 */
export const isFunction = (value) => {
  return typeof value === 'function'
}
/**
 * 判断字符串
 */
export const isString = (value) => {
  return typeof value === 'string'
}
/**
 * 判断数字
 */
export const isNumber = (value) => {
  return typeof value === 'number'
}
/**
 * 判断数组
 */
export const isArray = Array.isArray

// 合并
export const assign = (target, ...argus) => {
  return Object.assign(target, ...argus)
}
// 判断是否是整数索引
export const isIntegerKey = (key) => {
  return parseInt(key) + '' == key
}
// 判断是否属于目标对象上的属性key
export const hasOwn = (target, key) => {
  const hasOwnKey = Object.prototype.hasOwnProperty
  return hasOwnKey.call(target, key)
}
// 判断两个值是否相当
export const hasChange = (value, oldValue) => value !== oldValue