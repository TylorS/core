import {isArrayLike} from '@most/prelude'

import {fromArray} from './fromArray'
import {fromIterable} from './fromIterable'

import {isIterable} from '../util/index'

export function from (a) { // eslint-disable-line complexity
  if (Array.isArray(a) || isArrayLike(a)) {
    return fromArray(a)
  }

  if (isIterable(a)) {
    return fromIterable(a)
  }

  throw new TypeError(`not iterable ${a}`)
}
