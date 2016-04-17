import {curry2, noop} from '@most/prelude'

import {Stream} from '../Stream'
import {all} from '../disposable/index'
import {join} from './flatMap'

export const takeUntil = curry2((signal, stream) => {
  return new Stream(new Until(signal.source, stream.source))
})

export const skipUntil = curry2((signal, stream) => {
  return new Stream(new Since(signal.source, stream.source))
})

export const during = curry2((timeWindow, stream) => {
  return takeUntil(join(timeWindow), skipUntil(timeWindow, stream))
})

class Until {
  constructor (maxSignal, source) {
    this.maxSignal = maxSignal
    this.source = source
  }

  run (sink, scheduler) {
    const min = new Bound(-Infinity, sink)
    const max = new UpperBound(this.maxSignal, sink, scheduler)
    const disposable = this.source.run(new TimeWindowSink(min, max, sink), scheduler)

    return all([min, max, disposable])
  }
}

class Since {
  constructor (minSignal, source) {
    this.minSignal = minSignal
    this.source = source
  }

  run (sink, scheduler) {
    const min = new LowerBound(this.minSignal, sink, scheduler)
    const max = new Bound(Infinity, sink)
    const disposable = this.source.run(new TimeWindowSink(min, max, sink), scheduler)

    return all([min, max, disposable])
  }
}

class Bound {
  constructor (value, sink) {
    this.value = value
    this.sink = sink
  }

  event () { return void 0 }
  error (time, err) { this.sink.error(time, err) }
  end () { return void 0 }
  dispose () { return void 0 }

}

class TimeWindowSink {
  constructor (min, max, sink) {
    this.min = min
    this.max = max
    this.sink = sink
  }

  event (time, value) {
    if (time >= this.min.value && time < this.max.value) {
      this.sink.event(time, value)
    }
  }

  error (time, err) { this.sink.error(time, err) }

  end (time, value) { this.sink.end(time, value) }
}

class LowerBound {
  constructor (signal, sink, scheduler) {
    this.value = Infinity
    this.sink = sink
    this.disposable = signal.run(this, scheduler)
  }

  event (time /*, value */) {
    if (time < this.value) {
      this.value = time
    }
  }

  error (time, err) { this.sink.error(time, err) }

  end () { return void 0 }

  dispose () {
    return this.disposable.dispose()
  }
}

class UpperBound {
  constructor (signal, sink, scheduler) {
    this.value = Infinity
    this.sink = sink
    this.disposable = signal.run(this, scheduler)
  }

  event (time, value) {
    if (time < this.value) {
      this.value = time
      this.sink.end(time, value)
    }
  }

  error (time, err) { this.sink.error(time, err) }

  end () { return void 0 }

  dispose () {
    return this.disposable.dispose()
  }
}
