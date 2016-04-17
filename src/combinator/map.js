import {compose, curry2} from '@most/prelude'

import {Stream} from '../Stream'
import {Filter} from './filter'
import {FilterMap} from './FilterMap'

export const map = curry2(function map (fn, stream) {
  return new Stream(Map.create(fn, stream.source))
})

export class Map {
  constructor (fn, source) {
    this.fn = fn
    this.source = source
  }

  static create (fn, source) { // eslint-disable-line complexity
    if (source instanceof Map) {
      return new Map(compose(fn, source.fn), source.source)
    }

    if (source instanceof Filter) {
      return new FilterMap(source.predicate, fn, source.source)
    }

    if (source instanceof FilterMap) {
      return new FilterMap(source.predicate, compose(fn, source.fn), source.source)
    }

    return new Map(fn, source)
  }

  run (sink, scheduler) {
    return this.source.run(new MapSink(this.fn, sink), scheduler)
  }
}

class MapSink {
  constructor (fn, sink) {
    this.fn = fn
    this.sink = sink
  }

  event (time, value) {
    this.sink.event(time, this.fn(value))
  }

  error (time, err) { this.sink.error(time, err) }

  end (time, value) { this.sink.end(time, value) }
}
