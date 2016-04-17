import {curry2} from '@most/prelude'

import {Stream} from '../Stream'
import {all} from '../disposable/index'
import {PropagateTask} from '../scheduler/index'

export const throttle = curry2((period, stream) => {
  return new Stream(new Throttle(period, stream.source))
})

export const debounce = curry2((period, stream) => {
  return new Stream(new Debounce(period, stream.source))
})

class Throttle {
  constructor (period, source) {
    this.dt = period
    this.source = source
  }

  run (sink, scheduler) {
    return this.source.run(new ThrottleSink(this.dt, sink), scheduler)
  }
}

class ThrottleSink {
  constructor (dt, sink) {
    this.dt = dt
    this.sink = sink
    this.time = 0
  }

  event (time, value) {
    if (time >= this.time) {
      this.time = time + this.dt
      this.sink.event(time, value)
    }
  }

  error (time, err) { this.sink.error(time, err) }

  end (time, value) { this.sink.end(time, value) }
}

class Debounce {
  constructor (dt, source) {
    this.dt = dt
    this.source = source
  }

  run (sink, scheduler) {
    return new DebounceSink(this.dt, this.source, sink, scheduler)
  }
}

class DebounceSink {
  constructor (dt, source, sink, scheduler) {
    this.dt = dt
    this.sink = sink
    this.scheduler = scheduler
    this.value = void 0
    this.timer = null

    const sourceDisposable = source.run(this, scheduler)
    this.diposable = all([this, sourceDisposable])
  }

  event (time, value) {
    this._clearTimer()
    this.value = value
    this.timer = this.scheduler.delay(this.dt, PropagateTask.event(value, this.sink))
  }

  error (time, err) {
    this._clearTimer()
    this.sink.error(time, err)
  }

  end (time, value) {
    if (this._clearTimer()) {
      this.sink.event(time, this.value)
      this.value = void 0
    }
    this.sink.end(time, value)
  }

  _clearTimer () {
    if (this.timer === null) {
      return false
    }
    this.timer.cancel()
    this.timer = null
    return true
  }
}
