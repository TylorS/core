import {apply, curry2} from '@most/prelude'

import {combineArray} from './combine'

export const ap = curry2((fs, stream) => {
  return combineArray(apply, [fs, stream])
})
