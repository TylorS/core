import {curry2} from '@most/prelude'

import {Stream} from '../Stream'

export const iterate = curry2(function iterate (fn, initial) {
  return new Stream(new IterateSource(fn, initial))
})

class IterateSource {
  constructor (fn, initial) {
    this.fn = fn
    this.initial = initial
  }

  run (sink, scheduler) {
    return new Iterate(this.fn, this.initial, sink, scheduler)
  }
}

class Iterate {
  constructor (fn, initial, sink, scheduler) {
    this.fn = fn
    this.sink = sink
    this.scheduler = scheduler
    this.active = true

    var self = this
    function err (e) {
      self.sink.error(self.scheduler.now(), e)
    }

    function start (iterate) {
      return stepIterate(iterate, initial)
    }

    Promise.resolve(this).then(start).catch(err)
  }

  dispose () { this.active = false }
}

function stepIterate (iterate, x) {
  iterate.sink.event(iterate.scheduler.now(), x)

  if (!iterate.active) {
    return x
  }

  const f = iterate.fn
  return Promise.resolve(f(x)).then(function (y) {
    return continueIterate(iterate, y)
  })
}

function continueIterate (iterate, x) {
  return !iterate.active ? iterate.value : stepIterate(iterate, x)
}
