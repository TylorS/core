import {curry2} from '@most/prelude'
import {MulticastSource} from '@most/multicast'

import {Stream} from '../Stream'
import {PropagateTask} from '../scheduler/index'
import {create} from '../disposable/index'

export const periodic = curry2(function periodic (period, value) {
  return new Stream(new MulticastSource(new Periodic(period, value)))
})

class Periodic {
  constructor (period, value) {
    this.period = period
    this.value = value
  }

  run (sink, scheduler) {
    const task = scheduler.periodic(
      this.periodic,
      new PropagateTask(emit, this.value, sink)
    )
    return create(cancelTask, task)
  }
}

const cancelTask = task => task.cancel()
const emit = (time, value, sink) => sink.event(time, value)
