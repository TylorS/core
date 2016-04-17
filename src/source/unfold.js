import {curry2} from '@most/prelude'

import {Stream} from '../Stream'

export const unfold = curry2(function unfold (fn, seed) {
  return new Stream(new UnfoldSource(fn, seed))
})

class UnfoldSource {
  constructor (fn, seed) {
    this.fn = fn
    this.value = seed
  }

  run (sink, scheduler) {
    return new Unfold(this.fn, this.value, sink, scheduler)
  }
}

class Unfold {
  constructor (fn, value, sink, scheduler) {
    this.fn = fn
    this.sink = sink
    this.scheduler = scheduler
    this.active = true

    const err = e => sink.error(scheduler.now(), e)
    const start = unfold => stepUnfold(unfold, value)

    Promise.resolve(this).then(start).catch(err)
  }

  dispose () { this.active = false }
}

function stepUnfold (unfold, value) {
  return Promise.resolve(unfold.fn(value)).then(tuple => {
    return continueUnfold(unfold, tuple)
  })
}

function continueUnfold (unfold, {value, done}) {
  if (done) {
    unfold.sink.end(unfold.scheduler.now(), value)
    return value
  }

  unfold.sink.event(unfold.scheduler.now(), value)

  if (!unfold.active) {
    return value
  }
  return stepUnfold(unfold, value)
}
