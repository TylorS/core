import {curry2, reduce} from '@most/prelude'

import {Stream} from '../Stream'
import {IndexSink} from '../sink/index'
import {empty} from '../source/index'
import {tryDispose, all} from '../disposable/index'

export function mergeArray (arrayOfStreams) {
  const length = arrayOfStreams.length
  return length === 0 ? empty()
    : length === 1 ? arrayOfStreams[0]
    : new Stream(mergeSources(arrayOfStreams))
}

export const merge = curry2((stream1, stream2) => {
  return mergeArray([stream1, stream2])
})

function mergeSources (arrayOfStreams) {
  return new Merge(reduce(appendSources, [], arrayOfStreams))
}

function appendSources (sources, stream) {
  const source = stream.source
  return source instanceof Merge
    ? sources.concat(source.sources)
    : sources.concat(source)
}

class Merge {
  constructor (sources) {
    this.sources = sources
  }

  run (sink, scheduler) {
    const length = this.sources.length
    const disposables = Array(length)
    const sinks = Array(length)

    const mergeSink = new MergeSink(disposables, sinks, sink)

    let indexSink
    for (let i = 0; i < length; ++i) {
      indexSink = sinks[i] = new IndexSink(i, mergeSink)
      disposables[i] = this.sources[i].run(indexSink, scheduler)
    }

    return all(disposables)
  }
}

class MergeSink {
  constructor (disposables, sinks, sink) {
    this.sink = sink
    this.disposables = disposables
    this.activeCount = sinks.length
  }

  event (time, {value}) {
    this.sink.event(time, value)
  }

  error (time, err) { this.sink.error(time, err) }

  end (time, {index, value}) {
    tryDispose(time, this.disposables[index], this.sink)
    if (--this.activeCount === 0) {
      this.sink.end(time, value)
    }
  }
}
