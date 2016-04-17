import {MulticastSource} from '@most/multicast'

import {Stream} from '../Stream'
import {DeferredSink} from '../sink/index'
import {tryEvent, tryEnd} from '../util/index'

export function create (subscribe) {
  return new Stream(new MulticastSource(new SubscribeSource(subscribe)))
}

class SubscribeSource {
  constructor (subscribe) {
    this.subscribe = subscribe
  }

  run (sink, scheduler) {
    return new Subscription(new DeferredSink(sink), scheduler, this.subscribe)
  }
}

class Subscription {
  constructor (sink, scheduler, subscribe) {
    this.sink = sink
    this.scheduler = scheduler
    this.active = true
    this.unsubscribe = this.init(subscribe)
  }

  init (subscribe) {
    const add = value => this.add(value)
    const error = err => this.error(err)
    const end = value => this.end(value)

    try {
      return subscribe(add, end, error)
    } catch (err) {
      error(err)
    }
  }

  dispose () {
    this.active = false
    if (typeof this.unsubscribe === 'function') {
      return this.unsubscribe.call(void 0)
    }
  }

  add (value) {
    if (!this.active) { return }
    tryEvent(this.scheduler.now(), value, this.sink)
  }

  error (err) {
    this.active = false
    this.sink.error(this.scheduler.now(), err)
  }

  end (value) {
    if (!this.active) { return }
    this.active = false
    tryEnd(this.scheduler.now(), value, this.sink)
  }
}
