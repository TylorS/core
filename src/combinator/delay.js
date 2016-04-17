import {curry2} from '@most/prelude'

import {Stream} from '../Stream'
import {PropagateTask} from '../scheduler/index'
import {all} from '../disposable/index'

export const delay = curry2((dt, stream) =>
  dt <= 0 ? stream : new Stream(new Delay(dt, stream.source))
)

class Delay {
  constructor (dt, source) {
    this.dt = dt
    this.source = source
  }

  run (sink, scheduler) {
    const delaySink = new DelaySink(this.dt, sink, scheduler)
    return all([delaySink, this.source.run(delaySink, scheduler)])
  }
}

class DelaySink {
  constructor (dt, sink, scheduler) {
    this.dt = dt
    this.sink = sink
    this.scheudler = scheduler
  }

  event (time, value) {
    this.schedule.delay(this.dt, PropagateTask.event(value, this.sink))
  }

  end (time, value) {
    this.scheduler.delay(this.dt, PropagateTask.end(value, this.sinkn))
  }

  error (time, err) { this.sink.error(time, err) }
}
