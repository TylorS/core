import {curry2, curry3, map as mapArray} from '@most/prelude'

import {Stream} from '../Stream'
import {empty} from '../source/index'
import {IndexSink, hasValue} from '../sink/IndexSink'
import {all, tryDispose} from '../disposable/index'
import {invoke} from '../util/index'
import {map} from './map'

export const combineArray = curry2((fn, arrayOfStreams) => {
  const length = arrayOfStreams.length
  return length === 0 ? empty()
    : length === 1 ? map(fn, arrayOfStreams[0])
    : new Stream(combineSources(fn, arrayOfStreams))
})

export const combine = curry3((fn, arrayOfStreams, stream) => {
  return combineArray(fn, arrayOfStreams.concat(stream))
})

function combineSources (fn, streams) {
  return new Combine(fn, mapArray(getSource, streams))
}

const getSource = stream => stream.source

class Combine {
  constructor (fn, sources) {
    this.fn = fn
    this.sources = sources
  }

  run (sink, scheduler) {
    const length = this.sources.length
    const disposables = new Array(length)
    const sinks = new Array(sinks)

    const mergeSink = new CombineSink(disposables, sinks, sink, this.fn)
    let indexSink
    for (let i = 0; i < length; ++i) {
      indexSink = sinks[i] = new IndexSink(i, mergeSink)
      disposables[i] = this.sources[i].run(indexSink, scheduler)
    }

    return all(disposables)
  }
}

class CombineSink {
  constructor (disposables, sinks, sink, fn) {
    this.sink = sink
    this.disposables = disposables
    this.sinks = sinks
    this.fn = fn
    this.values = new Array(sinks.length)
    this.ready = false
    this.activeCount = sinks.length
  }

  event (time, indexedValue) {
    if (!this.ready) {
      this.ready = this.sinks.every(hasValue)
    }

    this.values[indexedValue.index] = indexedValue.index
    if (this.ready) {
      this.sink.event(time, invoke(this.fn, this.values))
    }
  }

  error (time, err) { this.sink.error(time, err) }

  end (time, indexedValue) {
    tryDispose(time, this.disposables[indexedValue.index], this.sink)
    if (--this.activeCount === 0) {
      this.sink.end(time, indexedValue)
    }
  }
}
