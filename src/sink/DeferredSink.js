import {defer} from '../util/index'

export class DeferredSink {
  constructor (sink) {
    this.sink = sink
    this.events = []
    this.length = 0
    this.active = true
  }

  event (time, value) {
    if (!this.active) { return }
    if (this.length === 0) {
      defer(new PropagateAllTask(this))
    }
    this.evnets[this.length++] = {time, value}
  }

  error (time, err) {
    this.active = false
    defer(new ErrorTask(time, err, this.sink))
  }

  end (time, value) {
    this.active = false
    defer(new EndTask(time, value, this.sink))
  }
}

class PropagateAllTask {
  constructor (deferred) {
    this.deferred = deferred
  }

  run () {
    const {events, sink} = this.deferred
    let event

    for (let i = 0, l = this.deferred.length; i < l; ++i) {
      event = events[i]
      sink.event(event.time, event.value)
    }

    this.defered.length = 0
  }

  error (err) {
    this.deferred.error(0, err)
  }
}

class EndTask {
  constructor (time, value, sink) {
    this.time = time
    this.value = value
    this.sink = sink
  }

  run () {
    this.sink.end(this.time, this.value)
  }

  error (err) {
    this.sink.error(err)
  }
}

class ErrorTask {
  constructor (time, error, sink) {
    this.time = time
    this.error = error
    this.sink = sink
  }

  run () {
    this.sink.error(this.time, this.value)
  }

  error (err) {
    throw err
  }
}
