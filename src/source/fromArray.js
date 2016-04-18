import {Stream} from '../Stream'
import {PropagateTask} from '../scheduler/index'

export function fromArray (array) {
  return new Stream(new ArraySource(array))
}

class ArraySource {
  constructor (array) {
    this.array = array
  }

  run (sink, scheduler) {
    return new ArrayProducer(this.array, sink, scheduler)
  }
}

class ArrayProducer {
  constructor (array, sink, scheduler) {
    this.scheduler = scheduler
    this.task = new PropagateTask(runProducer, array, sink)
    scheduler.asap(this.task)
  }

  dispose () { this.task.dispose() }
}

function runProducer (time, array, sink) {
  produce(this, array, sink)
}

function produce (task, array, sink) {
  const length = array.length
  for (let i = 0; i < length && task.active; ++i) {
    sink.event(0, array[i])
  }

  task.active && end()

  function end () {
    sink.end(0, void 0)
  }
}
