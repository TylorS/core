import {Observer} from './sink/index'
import {settable} from './disposable/index'
import {defaultScheduler} from './scheduler/index'

export function withDefaultScheduler (fn, source) {
  return withScheduler(fn, source, defaultScheduler)
}

export function withScheduler (fn, source, scheduler) {
  return new Promise((resolve, reject) => {
    runSource(fn, source, scheduler, resolve, reject)
  })
}

export function runSource (fn, source, scheduler, end, error) {
  const disposable = settable()
  const observer = new Observer(fn, end, error, disposable)
  disposable.setDisposable(source.run(observer, scheduler))
}
