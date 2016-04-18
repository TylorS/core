import {Suite} from 'benchmark'
import {filter, map, reduce, from} from '../src/index'
import * as rx4 from 'rx'
import * as rx5 from 'rxjs'
import bacon from 'baconjs'
import lodash from 'lodash'
import highland from 'highland'

import {
  getIntArg,
  kefirFromArray,
  runSuite,
  options,
  runMost,
  runRx4,
  runRx5,
  runKefir,
  runBacon,
  runHighland
} from './runners'

const n = getIntArg(1000000)
const a = new Array(n)
for (let i = 0; i < a.length; ++i) {
  a[i] = i
}

const suite = Suite('filter -> map -> reduce ' + n + ' integers')

suite
  .add('most',
    deferred => runMost(deferred, reduce(sum, 0, map(add1, filter(even, from(a))))),
    options
  )
  .add('Rx 4',
    deferred => runRx4(deferred, rx4.Observable.from(a).filter(even).map(add1).reduce(sum, 0)),
    options
  )
  .add('Rx 5',
    deferred => runRx5(deferred, rx5.Observable.from(a).filter(even).map(add1).reduce(sum, 0)),
    options
  )
  .add('kefir',
    deferred => runKefir(deferred, kefirFromArray(a).filter(even).map(add1).scan(sum, 0).last()),
    options
  )
  .add('bacon',
    deferred => runBacon(deferred, bacon.fromArray(a).filter(even).map(add1).reduce(0, sum)),
    options
  )
  .add('highland',
    deferred => runHighland(deferred, highland(a).filter(even).map(add1).reduce(0, sum)),
    options
  )
  .add('lodash', () => lodash(a).filter(even).map(add1).reduce(sum, 0))
  .add('Array', () => a.filter(even).map(add1).reduce(sum, 0))

const add1 = x => x + 1
const even = x => x % 2 === 0
const sum = (x, y) => x + y

runSuite(suite)
