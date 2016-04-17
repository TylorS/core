import {domEvent} from '@most/dom-event'
import {curry2} from '@most/prelude'

import {Stream} from '../Stream'

const isEventTarget = e => typeof e.addEventListener === 'function' &&
  typeof e.removeEventListener === 'function'

const isEventEmitter = e => typeof e.addListener === 'function' &&
  typeof e.removeListener === 'function'

export const fromEvent = curry2(function fromEvent (event, source, useCapture = false) {
  if (isEventTarget(source)) {
    return domEvent(event, source, useCapture)
  } else if (isEventEmitter(source)) {
    return new Stream(EventEmitterSource(event, source))
  } else {
    throw new Error('source must support addEventListener/removeEventListener or addListener/removeListener')
  }
})

import {create} from '../disposable/index'
import {DeferredSink} from '../sink/index'
import {tryEvent} from '../util/index'

class EventEmitterSource {
  constructor (event, source) {
    this.event = event
    this.source = source
  }

  run (sink, scheduler) {
    const dsink = new DeferredSink(sink)

    function addEventVariadic (a) {
      var l = arguments.length
      if (l > 1) {
        var arr = new Array(l)
        for (let i = 0; i < l; ++i) {
          arr[i] = arguments[i]
        }
        tryEvent(scheduler.now(), arr, dsink)
      } else {
        tryEvent.tryEvent(scheduler.now(), a, dsink)
      }
    }

    this.source.addListener(this.event, addEventVariadic)

    return create(disposeEventEmitter, {target: this, addEventVariadic})
  }
}

function disposeEventEmitter ({target, addEventVariadic}) {
  target.source.removeListener(target.event, addEventVariadic)
}
