import {curry2} from '@most/prelude'

import {of} from '../source/index'
import {continueWith} from './continueWith'

export const concat = curry2((left, right) => continueWith(() => right, left))
export const startWith = curry2((value, stream) => concat(of(value), stream))
