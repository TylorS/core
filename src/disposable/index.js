import {map, id} from '@most/prelude'

import {Disposable} from './Disposable'
import {SettableDisposable} from './SettableDisposable'
// export for extenal use-cases
export {Disposable, SettableDisposable}

import {isPromise} from '../util/index'

// helper functions for disposables

export function tryDispose (time, disposable, sink) {
  const result = disposeSafely(disposable)
  return isPromise(result)
    ? result.catch(err => sink.error(time, err))
    : result
}

export function once (disposable) {
  return new Disposable(disposeMemoized, memoized(disposable))
}

export function create (dispose, data) {
  return once(new Disposable(dispose, data))
}

export function empty () {
  return new Disposable(id, void 0)
}

export function all (disposables) {
  return create(disposeAll, disposables)
}

export function settable () {
  return new SettableDisposable()
}

export function promised (disposablePromise) {
  return create(disposePromise, disposablePromise)
}

function disposeSafely (disposable) {
  try {
    return disposable.dispose()
  } catch (e) {
    return Promise.resolve(e)
  }
}

function memoized (disposable) {
  return {disposed: false, disposable, value: void 0}
}

function disposeMemoized (memoized) {
  if (!memoized.disposed) {
    memoized.disposed = true
    memoized.value = disposeSafely(memoized.disposable)
    memoized.disposable = void 0
  }

  return memoized.value
}

function disposeAll (disposables) {
  return Promise.all(map(disposeSafely, disposables))
}

function disposeOne (disposable) {
  return disposable.dispose()
}

function disposePromise (disposablePromise) {
  return disposablePromise.then(disposeOne)
}
