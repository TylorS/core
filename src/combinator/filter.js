import {curry2} from '@most/prelude'

import {Stream} from '../Stream'

export const filter = curry2(function filter (predicate, stream) {
  return new Stream(Filter.create(predicate, stream.source))
})

export class Filter {
  constructor (predicate, source) {
    this.predicate = predicate
    this.source = source
  }

  static create (predicate, source) {
    if (source instanceof Filter) {
      return new Filter(and(source.predicate, predicate), source)
    }

    return new Filter(predicate, source)
  }

  run (sink, scheduler) {
    return this.source.run(new FilterSink(this.predicate, sink), scheduler)
  }
}

class FilterSink {
  constructor (predicate, sink) {
    this.predicate = predicate
    this.sink = sink
  }

  event (time, value) {
    if (this.predicate(value)) {
      this.sink.event(time, value)
    }
  }

  error (time, err) { this.sink.error(time, err) }

  end (time, value) { this.sink.end(time, value) }
}

const and = (f, g) => x => f(x) && g(x)
