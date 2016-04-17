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

function runProducer (task, array, sink) {
  for (let i = 0, l = array.length; i < l && task.active; ++i) {
    sink.event(0, array[i])
  }
  const end = () => sink.end(0)

  task.active && end()
}
