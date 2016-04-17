export class IndexSink {
  constructor (index, sink) {
    this.index = index
    this.sink = sink
    this.active = true
    this.hasValue = false
    this.value = void 0
  }

  event (time, value) {
    if (!this.active) { return }
    this.value = value
    this.hasValue = true
    this.sink.event(time, value)
  }

  error (time, err) {
    this.active = false
    this.sink.error(time, err)
  }

  end (time, value) {
    if (!this.active) { return }
    this.active = false
    this.sink.end(time, {index: this.index, value})
  }
}

export function hasValue (sink) {
  return sink.hasValue
}
