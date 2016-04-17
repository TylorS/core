import {curry2} from '@most/prelude'

import {Stream} from '../Stream'

export const generate = curry2(function generate (fn, args) {
  return new Stream(new GenerateSource(fn, args))
})

class GenerateSource {
  constructor (fn, args) {
    this.fn = fn
    this.args = args
  }

  run (sink, scheduler) {
    return new Generate(this.fn.apply(void 0, this.args), sink, scheduler)
  }
}

class Generate {
  constructor (iterator, sink, scheduler) {
    this.iterator = iterator
    this.sink = sink
    this.scheduler = scheduler
    this.active = true

    const err = e => sink.error(scheduler.now(), e)

    Promise.resolve(this).then(next).catch(err)
  }

  dispose () { this.active = false }
}

const next = (generate, x) =>
  generate.active ? handle(generate, generate.iterator.next(x)) : x

function handle (generate, {done, value}) {
  if (done) {
    return generate.sink.end(generate.scheduler.now(), value)
  }

  return Promise.resolve(value).then(x => emit(x), e => error(e))
}

function emit (generate, x) {
  generate.sink.event(generate.scheduler.now(), x)
  return next(generate, x)
}

function error (generate, e) {
  return handle(generate, generate.iterator.throw(e))
}
