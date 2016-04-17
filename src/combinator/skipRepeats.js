import {curry2} from '@most/prelude'

import {Stream} from '../Stream'

export const skipRepeats = stream =>
  new Stream(new SkipRepeats(same, stream.source))

export const skipRepeatsWith = curry2(function skipRepeatsWith (equals, stream) {
  return new Stream(new SkipRepeats(equals, stream.source))
})

class SkipRepeats {
  constructor (equals, source) {
    this.equals = equals
    this.source = source
  }

  run (sink, scheduler) {
    return this.source.run(new SkipRepeatsSink(this.equals, sink), scheduler)
  }
}

class SkipRepeatsSink {
  constructor (equals, sink) {
    this.equals = equals
    this.sink = sink
    this.value === void 0
    this.init = true
  }

  event (time, value) {
    if (this.init) {
      this.init = false
      this.value = value
      this.sink.event(time, value)
    } else if (!this.equals(this.value, value)) {
      this.value = value
      this.sink.event(time, value)
    }
  }

  error (time, err) { this.sink.error(time, err) }

  end (time, value) { this.sink.end(time, value) }
}

const same = (a, b) => a === b
