import {curry2} from '@most/prelude'

import {mergeConcurrently, mergeMapConcurrently} from './mergeConcurrently'

export const flatMap = curry2((fn, stream) => {
  return mergeMapConcurrently(fn, Infinity, stream)
})

export const chain = curry2((fn, stream) => {
  return mergeMapConcurrently(fn, Infinity, stream)
})

export const join = stream => mergeConcurrently(Infinity, stream)
