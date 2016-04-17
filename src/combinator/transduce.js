import {curry2} from '@most/prelude'

import {Stream} from '../Stream'

export const transduce = curry2((transducer, stream) => {
  return new Stream(new Transduce(transducer, stream.source))
})

class Transduce {
  constructor (transducer, source) {
    this.transducer = transducer
    this.source = source
  }

  run (sink, scheduler) {
    const xf = this.transducer(new Transformer(sink))
    return this.source.run(new TransduceSink(getTxHandler(xf), sink), scheduler)
  }
}

class TransduceSink {
  constructor (adapter, sink) {
    this.xf = adapter
    this.sink = sink
  }

  event (time, value) {
    const next = this.xf.step(time, value)

    return this.xf.isReduced(next)
      ? this.sink.end(time, this.xf.getResult(next))
      : next
  }

  error (time, err) {
    return this.sink.error(time, err)
  }

  end (time, value) {
    return this.xf.result(value)
  }
}

class Transformer {
  constructor (sink) {
    this.time = -Infinity
    this.sink = sink
  }

  '@@transducer/init' () { return void 0 }

  '@@transducer/step' (time, value) {
    if (!isNaN(time)) {
      this.time = Math.max(time, this.time)
    }
    return this.sink.event(this.time, value)
  }

  '@@transducer/result' (value) {
    return this.sink.end(this.time, value)
  }
}

function getTxHandler (tx) {
  return typeof tx['@@transducer/step'] === 'function'
    ? new TxAdapter(tx)
    : new LegacyTxAdapter(tx)
}

class TxAdapter {
  constructor (tx) {
    this.tx = tx
  }

  step (time, value) {
    return this.tx['@@transducer/step'](time, value)
  }

  result (value) {
    return this.tx['@@transducer/result'](value)
  }

  isReduced (value) {
    return value !== null && value['@@transducer/reduced']
  }

  getResult (value) {
    return value['@@transducer/value']
  }
}

class LegacyTxAdapter {
  constructor (tx) {
    this.tx = tx
  }

  step (time, value) {
    return this.tx.step(time, value)
  }

  result (value) {
    return this.tx.result(value)
  }

  isReduced (value) {
    return value !== null && value.__transducers_reduced__
  }

  getResult (value) {
    return value.value
  }
}
