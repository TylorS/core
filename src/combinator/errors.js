import {apply, curry2} from '@most/prelude'

import {Stream} from '../Stream'
import {tryDispose} from '../disposable/index'
import {tryEvent, tryEnd} from '../util/index'

export const recoverWith = curry2((fn, stream) => {
  return new Stream(new RecoverWith(fn, stream.source))
})

export const flatMapError = curry2((fn, stream) => {
  return new Stream(new RecoverWith(fn, stream.source))
})

class RecoverWith {
  constructor (fn, source) {
    this.fn = fn
    this.source = source
  }

  run (sink, scheduler) {
    return new RecoverWithSink(this.fn, this.source, sink, scheduler)
  }
}

class RecoverWithSink {
  constructor (fn, source, sink, scheduler) {
    this.fn = fn
    this.sink = sink
    this.scheduler = scheduler
    this.active = true
    this.disposable = source.run(this, scheduler)
  }

  event (time, value) {
    if (!this.active) { return }
    tryEvent(time, value, this.sink)
  }

  error (time, err) {
    if (!this.active) { return }

    // TODO: forward dispose errors
    tryDispose(time, this.disposable, this)

    const {source} = apply(this.fn, err)
    this.disposable = source.run(this.sink, this.scheduler)
  }

  end (time, value) {
    if (!this.active) { return }
    tryEnd(time, value, this.sink)
  }

  dispose () {
    this.active = false
    return this.disposable.dispose()
  }
}
