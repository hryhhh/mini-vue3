export function isObject(value: any) {
  return value !== null && typeof value === 'object'
}

export function isFunction(value:any) {
  return typeof value ==="function"
}
export function isString(value:any) {
  return typeof value ==="string" 
}

export * from './shapeFlags'