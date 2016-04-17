import {curry3} from '@most/prelude'

import {Stream} from '../Stream'

export const loop = curry3((stepper, seed, stream) => {
  return new Stream(new Loop(stepper, seed, stream.source))
})

class Loop {
  constructor (stepper, seed, source) {
    this.stepper = stepper
    this.seed = seed
    this.source = source
  }

  run (sink, scheduler) {
    return this.source.run(new LoopSink(this.stepper, this.seed, sink), scheduler)
  }
}

class LoopSink {
  constructor (stepper, seed, sink) {
    this.step = stepper
    this.seed = seed
    this.sink = sink
  }

  event (time, x) {
    const {seed, value} = this.step(this.seed, x)
    this.seed = seed
    this.sink.event(time, value)
  }

  error (time, err) { this.sink.error(time, err) }

  end (time) {
    this.sink.end(time, this.seed)
  }
}
