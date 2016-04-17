import {Stream} from '../Stream'
import {PropagateTask} from '../scheduler/index'
import * as disposable from '../disposable/index'

export const of = value => new Stream(new ValueSource(value))
export const just = value => of(value) // alias for of
export const empty = () => EMPTY
export const never = () => NEVER

const EMPTY = new Stream({
  run (sink, scheduler) {
    const task = PropagateTask.end(void 0, sink)
    scheduler.asap(task)
    return disposable.create(t => t.dispose(), task)
  }
})

const NEVER = new Stream({
  run () {
    return disposable.empty()
  }
})

class ValueSource {
  constructor (value) {
    this.value = value
  }

  run (sink, scheduler) {
    sink.event(scheduler.now(), this.value)
    sink.end(scheduler.now(), this.value)

    return disposable.empty()
  }
}
