
import { nodeOps } from './nodeOps'
import  patchProp  from './patchProp'

const renderOptions = Object.assign({ patchProp }, nodeOps)

export { renderOptions }
export * from "@vue/reactivity"
