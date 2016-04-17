import {curry3} from '@most/prelude'

import {Stream} from '../Stream'
import {combineArray} from './combine'

export const sample = curry3((fn, sampler, stream) =>
  new Stream(new SampleSource(fn, sampler, stream)))

const arrayId = (...values) => values

export const sampleArray = curry3((fn, sampler, arrayOfStreams) =>
  sample(fn, sampler, combineArray(arrayId, arrayOfStreams)))

class SampleSource {
  constructor (fn, sampler, stream) {
    this.fn = fn
    this.sampler = sampler.source
    this.source = stream.source
  }

  run (sink, scheduler) {
    const sampleSink = new SampleSink(this.fn, this.source, sink)
    const samplerDisposable = this.sampler.run(sampleSink, scheduler)
    const sourceDisposable = this.source.run(sampleSink.hold, scheduler)

    return {
      dispose () {
        return Promise.all([
          samplerDisposable.dispose(),
          sourceDisposable.dispose()
        ])
      }
    }
  }
}

class SampleSink {
  constructor (fn, source, sink) {
    this.fn = fn
    this.source = source
    this.sink = sink
    this.active = false
    this.hold = new SampleHold(this)
  }

  event (time, value) {
    if (this.hold.hasValue) {
      this.sink.event(time, this.fn(value, this.hold.value))
    }
  }

  error (time, err) {
    return this.sink.error(time, err)
  }

  end (time, value) {
    return this.sink.end(time, value)
  }
}

class SampleHold {
  constructor (sink) {
    this.sink = sink
    this.hasValue = false
  }

  event (time, value) {
    this.value = value
    this.hasValue = true
  }

  end () {}

  error (time, err) {
    this.sink.error(time, err)
  }
}
