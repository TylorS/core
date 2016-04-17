import {curry2} from '@most/prelude'

import {Stream} from '../Stream'
import {once, promised, tryDispose} from '../disposable/index'
import {isPromise} from '../util/index'

export const continueWith = curry2((fn, stream) => {
  return new Stream(new ContinueWith(fn, stream.source))
})

class ContinueWith {
  constructor (fn, source) {
    this.fn = fn
    this.source = source
  }

  run (sink, scheduler) {
    return new ContinueWithSink(this.fn, this.source, sink, scheduler)
  }
}

class ContinueWithSink {
  constructor (fn, source, sink, scheduler) {
    this.fn = fn
    this.sink = sink
    this.scheduler = scheduler
    this.active = true
    this.disposable = once(source.run(this, scheduler))
  }

  event (time, value) {
    if (!this.active) { return }
    this.sink.event(time, value)
  }

  error (time, err) {
    this.active = false
    this.sink.error(time, err)
  }

  end (time, value) {
    if (!this.active) { return }

    const result = tryDispose(time, this.disposable, this.sink)
    this.disposable = isPromise(result)
      ? promised(this._thenContinue(result, value))
      : this._continue(this.fn, value)
  }

  _thenContinue (p, value) {
    const self = this
    p.then(() => {
      return self._continue(self.fn, value)
    })
  }

  _continue (fn, value) {
    return fn(value).source.run(this.sink, this.scheduler)
  }

  dispose () {
    this.active = false
    return this.disposable.dispose()
  }

}
