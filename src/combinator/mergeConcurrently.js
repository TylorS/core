import {curry2, curry3, id} from '@most/prelude'

import {Stream} from '../Stream'
import {tryDispose, once} from '../disposable/index'
import {LinkedList} from '../util/index'

export const mergeMapConcurrently = curry3((fn, concurrency, stream) => {
  return new Stream(new MergeConcurrently(fn, concurrency, stream.source))
})

export const mergeConcurrently = curry2((concurrency, stream) => {
  return new Stream(new MergeConcurrently(id, concurrency, stream.source))
})

class MergeConcurrently {
  constructor (fn, concurrency, source) {
    this.fn = fn
    this.concurrency = concurrency
    this.source = source
  }

  run (sink, scheduler) {
    return new Outer(this.fn, this.concurrency, this.source, sink, scheduler)
  }
}

class Outer {
  constructor (fn, concurrency, source, sink, scheduler) {
    this.fn = fn
    this.concurrency = concurrency
    this.sink = sink
    this.scheduler = scheduler
    this.pending = []
    this.current = new LinkedList()
    this.disposable = once(source.run(this, scheduler))
    this.active = true
  }

  event (time, stream) {
    this._addInner(time, stream)
  }

  error (time, err) {
    this.active = false
    this.sink.error(time, err)
  }

  end (time, value) {
    this.active = false
    tryDispose(time, this.disposable, this.sink)
    this._checkEnd(time, value)
  }

  dispose () {
    this.active = false
    this.pending.length = 0
    return Promise.all([this.disposable.dispose(), this.current.dispose()])
  }

  _addInner (time, stream) {
    if (this.current.length < this.concurrency) {
      this._startInner(time, stream)
    } else {
      this.pending.push(stream)
    }
  }

  _startInner (time, stream) {
    const innerSink = new Inner(time, this, this.sink)
    this.current.add(innerSink)
    innerSink.disposable = mapAndRun(this.fn, innerSink, this.scheduler, stream)
  }

  _endInner (time, value, inner) {
    this.current.remove(inner)
    tryDispose(time, inner, this)

    if (this.pending.length === 0) {
      this._checkEnd(time, value)
    } else {
      this._startInner(time, this.pending.shift())
    }
  }

  _checkEnd (time, value) {
    if (!this.active && this.current.isEmpty()) {
      this.sink.end(time, value)
    }
  }
}

function mapAndRun (fn, innerSink, scheduler, stream) {
  return fn(stream).source.run(innerSink, scheduler)
}

class Inner {
  constructor (time, outer, sink) {
    this.prev = this.next = null
    this.time = time
    this.outer = outer
    this.sink = sink
    this.disposable = void 0
  }

  event (time, value) {
    this.sink.event(Math.max(time, this.time), value)
  }

  error (time, err) {
    this.outer.error(Math.max(time, this.time), err)
  }

  end (time, value) {
    this.outer._endInner(Math.max(time, this.time), value, this)
  }

  dispose () {
    return this.disposable.dispose()
  }
}
