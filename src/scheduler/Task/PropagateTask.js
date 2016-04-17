import {fatalError} from '../../util/index'

export class PropagateTask {
  constructor (fn, value, sink) {
    this.fn = fn
    this.value = value
    this.sink = sink
    this.active = true
  }

  static event (value, sink) {
    return new PropagateTask(event, value, sink)
  }

  static error (err, sink) {
    return new PropagateTask(error, err, sink)
  }

  static end (value, sink) {
    return new PropagateTask(end, value, sink)
  }

  dispose () {
    this.active = false
  }

  run (time) {
    if (!this.active) {
      return
    }
    this.fn(time, this.value, this.sink)
  }

  error (time, err) {
    if (!this.active) {
      return fatalError(err)
    }
    this.sink.error(time, err)
  }
}

const event = (time, value, sink) => sink.event(time, value)

const error = (time, err, sink) => sink.error(time, err)

const end = (time, value, sink) => sink.end(time, value)
