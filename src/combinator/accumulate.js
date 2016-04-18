import {curry3} from '@most/prelude'

import {Stream} from '../Stream'
import {withDefaultScheduler} from '../runSource'
import {startWith} from './build'

export const scan = curry3((fn, initial, stream) =>
  startWith(initial, new Stream(new Accumulate(ScanSink, fn, initial, stream.source)))
)

export const reduce = curry3((fn, initial, stream) =>
  withDefaultScheduler(() => {}, new Accumulate(AccumulateSink, fn, initial, stream.source))
)

class Accumulate {
  constructor (SinkType, fn, initial, source) {
    this.SinkType = SinkType
    this.fn = fn
    this.initial = initial
    this.source = source
  }

  run (sink, scheduler) {
    return this.source.run(new this.SinkType(this.fn, this.initial, sink), scheduler)
  }
}

class ScanSink {
  constructor (fn, initial, sink) {
    this.fn = fn
    this.value = initial
    this.sink = sink
  }

  event (time, value) {
    this.value = this.fn(this.value, value)
    this.sink.event(time, this.value)
  }

  error (time, err) { this.sink.error(time, err) }

  end (time, value) { this.sink.end(time, value) }
}

class AccumulateSink extends ScanSink {
  end (time, value) {
    this.sink.end(time, this.value)
  }
}
