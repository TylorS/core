import {curry2, curry3, map as amap} from '@most/prelude'

import {Stream} from '../Stream'
import {empty} from '../source/index'
import {IndexSink} from '../sink/index'
import {all} from '../disposable/index'
import {invoke, Queue} from '../util/index'
import {map} from './map'

export const zipArray = curry2((fn, arrayOfStreams) => {
  const length = arrayOfStreams.length
  return length === 0 ? empty()
    : length === 1 ? map(fn, arrayOfStreams[0])
    : new Stream(new Zip(fn, amap(getSource, arrayOfStreams)))
})

export const zip = curry3((fn, arrayOfStreams, stream) => {
  return zipArray(fn, arrayOfStreams.concat(stream))
})

const getSource = ({source}) => source

class Zip {
  constructor (fn, sources) {
    this.fn = fn
    this.sources = sources
  }

  run (sink, scheduler) {
    const length = this.sources.length
    const disposables = Array(length)
    const sinks = Array(length)
    const buffers = Array(length)

    const zipSink = new ZipSink(this.fn, buffers, sinks, sink)

    let indexSink
    for (let i = 0; i < length; ++i) {
      buffers[i] = new Queue()
      indexSink = sinks[i] = new IndexSink(i, zipSink)
      disposables[i] = this.sources[i].run(indexSink, scheduler)
    }

    return all(disposables)
  }
}

class ZipSink {
  constructor (fn, buffers, sinks, sink) {
    this.fn = fn
    this.buffers = buffers
    this.sinks = sinks
    this.sink = sink
  }

  event (time, {index, value}) { // eslint-disable-line complexity
    const buffers = this.buffers
    const buffer = buffers[index]

    buffer.push(value)

    if (buffer.length() === 1) {
      if (!ready(this.buffers)) {
        return
      }

      emitZipped(this.fn, time, buffers, this.sink)
    }

    if (ended(this.buffers, this.sinks)) {
      this.sink.end(time, void 0)
    }
  }

  error (time, err) {
    this.sink.error(time, err)
  }

  end (time, {index, value}) {
    const buffer = this.buffers[index]
    if (buffer.isEmpty()) {
      this.sink.end(time, value)
    }
  }
}

function emitZipped (fn, time, buffers, sink) {
  sink.event(time, invoke(fn, amap(head, buffers)))
}

function head (buffer) {
  return buffer.shift()
}

function ended (buffers, sinks) {
  const length = buffers.length
  for (let i = 0; i < length; ++i) {
    if (buffers[i].isEmpty() && !sinks[i].active) {
      return true
    }
  }
  return false
}

function ready (buffers) {
  const length = buffers.length
  for (let i = 0; i < length; ++i) {
    if (buffers[i].isEmpty()) {
      return false
    }
  }
  return true
}
