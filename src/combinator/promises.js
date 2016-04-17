import {Stream} from '../Stream'
import {of} from '../source/index'
import {fatalError} from '../util/index'

export const awaitPromises = stream => new Stream(new Await(stream.source))
export const fromPromise = promise => awaitPromises(of(promise))

class Await {
  constructor (source) {
    this.source = source
  }

  run (sink, scheduler) {
    return this.source.run(new AwaitSink(sink, scheduler), scheduler)
  }
}

class AwaitSink {
  constructor (sink, scheduler) {
    this.sink = sink
    this.scheduler = scheduler
    this.queue = Promise.resolve()

    this._eventBound = x => sink.event(scheduler.now(), x)
    this._errorBound = e => sink.error(scheduler.now(), e)
    this._endBound = x => sink.end(scheduler.now(), x)
  }

  event (time, promise) {
    const self = this
    this.queue = this.queue
      .then(() => self._event(promise))
      .catch(this._errorBound)
  }

  error (time, err) {
    const self = this
    this.queue = this.queue
      .then(() => self._errorBound(err))
      .catch(fatalError)
  }

  end (time, value) {
    const self = this
    this.queue = this.queue
      .then(() => self._end(value))
      .catch(this._errorBound)
  }

  _event (promise) {
    return promise.then(this._eventBound)
  }

  _end (value) {
    return Promise.resolve(value).then(this._endBound)
  }
}
