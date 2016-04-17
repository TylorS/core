import {Stream} from '../Stream'
import {empty} from '../disposable/index'

export const throwError = err =>
  new Stream(new ErrorSource(err))

class ErrorSource {
  constructor (err) {
    this.err = err
  }

  run (sink, scheduler) {
    sink.error(scheduler.now(), this.err)
    return empty()
  }
}
