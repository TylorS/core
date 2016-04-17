import {noop, curry2} from '@most/prelude'

import {withDefaultScheduler} from '../runSource'

export const observe = curry2((fn, stream) => {
  return withDefaultScheduler(fn, stream.source)
})

export const drain = stream => withDefaultScheduler(noop, stream.source)
