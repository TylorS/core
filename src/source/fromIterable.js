import {Stream} from '../Stream'
import {PropagateTask} from '../scheduler/index'
import {getIterator} from '../util/index'

export function fromIterable (iterable) {
  return new Stream(new IterableSource(iterable))
}

class IterableSource {
  constructor (iterable) {
    this.iterable = iterable
  }

  run (sink, scheduler) {
    return new IteratorProducer(getIterator(this.iterable), sink, scheduler)
  }
}

class IteratorProducer {
  constructor (iterator, sink, scheduler) {
    this.scheduler = scheduler
    this.iterator = iterator
    this.task = new PropagateTask(runProducer, this, sink)
    scheduler.asap(this.task)
  }

  dispose () { this.task.dispose() }
}

function runProducer (time, {iterator, scheduler, task}, sink) {
  const x = iterator.next()

  if (x.done) {
    sink.end(time, x.value)
  } else {
    sink.event(time, x.value)
  }

  scheduler.asap(task)
}
