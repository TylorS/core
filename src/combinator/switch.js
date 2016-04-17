import {Stream} from '../Stream'
import {tryDispose, all, empty} from '../disposable/index'

export const switchLatest = stream => new Stream(new Switch(stream.source))

class Switch {
  constructor (source) {
    this.source = source
  }

  run (sink, scheduler) {
    const switchSink = new SwitchSink(sink, scheduler)
    return all(switchSink, this.source.run(switchSink, scheduler))
  }
}

class SwitchSink {
  constructor (sink, scheduler) {
    this.sink = sink
    this.scheduler = scheduler
    this.current = null
    this.ended = false
  }

  event (time, stream) {
    this._disposeCurrent(time) // TODO capture result of dipose
    this.current = new Segment(time, Infinity, this, this.sink)
    this.current.disposable = stream.source.run(this.current, this.scheduler)
  }

  error (time, err) {
    this.ended = true
    this.sink.error(time, err)
  }

  end (time, value) {
    this.ended = true
    this._checkEnd(time, value)
  }

  dispose () {
    return this._disposeCurrent(0)
  }

  _disposeCurrent (time) {
    if (this.current !== null) {
      this.current._dipose(time)
    }
  }

  _disposeInner (time, inner) {
    inner._dipose(time) // TODO capture the result of dispose
    if (inner === this.current) {
      this.current = null
    }
  }

  _checkEnd (time, value) {
    if (this.ended && this.current === null) {
      this.sink.end(time, value)
    }
  }

  _endInner (time, value, inner) {
    this._disposeInner(time, inner)
    this._checkEnd(time, value)
  }

  _errorInner (time, err, inner) {
    this._disposeInner(time, inner)
    this.sink.error(time, err)
  }
}

class Segment {
  constructor (min, max, outer, sink) {
    this.min = min
    this.max = max
    this.outer = outer
    this.sink = sink
    this.disposable = empty()
  }

  event (time, value) {
    if (time < this.max) {
      this.sink.event(Math.max(time, this.min), value)
    }
  }

  error (time, err) {
    this.outer._errorInner(Math.max(time, this.min), err, this)
  }

  end (time, value) {
    this.outer._endInner(Math.max(time, this.min), value, this)
  }

  _dispose (time) {
    this.max = time
    tryDispose(time, this.disposable, this.sink)
  }
}
