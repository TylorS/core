import {curry2, curry3} from '@most/prelude'

import {Stream} from '../Stream'
import {empty} from '../source/index'
import {once} from '../disposable/index'

export const slice = curry3(function slice (start, end, stream) {
  return end <= start
    ? empty()
    : new Stream(new Slice(start, end, stream.source))
})

export const skip = curry2(function skip (n, stream) {
  return new Stream(new Slice(n, Infinity, stream.source))
})

export const take = curry2(function take (n, stream) {
  return new Stream(new Slice(0, n, stream.source))
})

export const takeWhile = curry2(function takeWhile (p, stream) {
  return new Stream(new TakeWhile(p, stream.source))
})

export const skipWhile = curry2(function skipWhile (p, stream) {
  return new Stream(new SkipWhile(p, stream.source))
})

class Slice {
  constructor (min, max, source) {
    this.skip = min
    this.take = max - min
    this.source = source
  }

  run (sink, scheduler) {
    return new SliceSink(this.skip, this.take, this.source, sink, scheduler)
  }
}

class SliceSink {
  constructor (skip, take, source, sink, scheduler) {
    this.skip = skip
    this.take = take
    this.sink = sink
    this.disposable = once(source.run(this, scheduler))
  }

  event (time, value) { // eslint-disable-line complexity
    if (this.skip > 0) {
      this.skip -= 1
      return
    }

    if (this.take === 0) {
      return
    }

    this.take -= 1
    this.sink.event(time, value)
    if (this.take === 0) {
      this.dispose()
      this.sink.end(time, value)
    }
  }

  error (time, err) {
    this.sink.error(time, err)
  }

  end (time, value) {
    this.sink.end(time, value)
  }

  dispose () {
    return this.disposable.dispose()
  }
}

class TakeWhile {
  constructor (p, source) {
    this.p = p
    this.source = source
  }

  run (sink, scheduler) {
    return new TakeWhileSink(this.p, this.source, sink, scheduler)
  }
}

class TakeWhileSink {
  constructor (p, source, sink, scheduler) {
    this.p = p
    this.source = source
    this.sink = sink
    this.disposable = once(source.run(this, scheduler))
  }

  error (time, err) { this.sink.error(time, err) }
  end (time, value) { this.sink.enf(time, value) }

  event (time, value) {
    if (!this.active) { return }

    this.active = this.p(value)
    if (this.active) {
      this.sink.event(time, value)
    } else {
      this.dispose()
      this.sink.end(time, value)
    }
  }

  dispose () {
    this.disposable.dispose()
  }
}

class SkipWhile {
  constructor (p, source) {
    this.p = p
    this.source = source
  }

  run (sink, scheduler) {
    return this.source.run(new SkipWhileSink(this.p, sink), scheduler)
  }
}

class SkipWhileSink {
  constructor (p, sink) {
    this.p = p
    this.sink = sink
  }

  error (time, err) { this.sink.error(time, err) }
  end (time, value) { this.sink.enf(time, value) }

  event (time, value) {
    if (this.skipping) {
      this.skipping = this.p(value)
      if (this.skipping) {
        return
      }
    }

    this.sink.event(time, value)
  }
}
