import {curry2} from '@most/prelude'

import {map} from './map'

export const tap = curry2((fn, stream) => {
  return map(x => { fn(x); return x }, stream)
})

export const constant = curry2((value, stream) =>
  map(() => value, stream)
)
