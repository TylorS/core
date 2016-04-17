import {defer} from '../../util/index'

export class Task {
  constructor (fn) {
    this.fn = fn
    this.active = true
  }

  run () {
    if (!this.active) {
      return
    }
    const fn = this.fn
    return fn()
  }

  error (err) {
    throw err
  }

  cancel () {
    this.active = false
  }
}

export function runAsTask (fn) {
  const task = new Task(fn)
  defer(task)
  return task
}
