export class FilterMap {
  constructor (predicate, fn, source) {
    this.predicate = predicate
    this.fn = fn
    this.source = source
  }

  run (sink, scheduler) {
    return this.source.run(
      new FilterMapSink(this.predicate, this.fn, sink),
      scheduler
    )
  }
}

class FilterMapSink {
  constructor (predicate, fn, sink) {
    this.predicate = predicate
    this.fn = fn
    this.sink = sink
  }

  event (time, value) {
    if (this.predicate(value)) {
      this.sink.event(time, this.fn(value))
    }
  }

  error (time, err) { this.sink.error(time, err) }

  end (time, value) { this.sink.end(time, value) }
}
