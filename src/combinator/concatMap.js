import {curry2} from '@most/prelude'

import {mergeMapConcurrently} from './mergeConcurrently'

export const concatMap = curry2((fn, stream) =>
  mergeMapConcurrently(fn, 1, stream))
