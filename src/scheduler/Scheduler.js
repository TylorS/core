import {findIndex, removeAll} from '@most/prelude'

import {ScheduledTask} from './Task/index'
import {tryRunTask, binarySearch, insertByTime} from '../util/index'

export class Scheduler {
  constructor (timer) {
    this.timer = timer
    this.tasks = []
    this.timerId = null
    this.nextArrival = 0

    let self = this
    this._runReadyTasksBound = function () {
      self._runReadyTasks(self.now())
    }
  }

  // Public API

  now () {
    return this.timer.now()
  }

  asap (task) {
    return this.schedule(0, -1, task)
  }

  delay (delay, task) {
    return this.schedule(delay, -1, task)
  }

  periodic (period, task) {
    return this.schedule(0, period, task)
  }

  schedule (delay, period, task) {
    const now = this.now()
    const st = new ScheduledTask(now + Math.max(0, delay), period, task, this)
    insertByTime(st, this.tasks)
    this._scheduleNextRun(now)
    return st
  }

  cancel (task) {
    task.active = false
    const index = binarySearch(task.time, this.tasks)

    if (index >= 0 && index < this.tasks.length) {
      const atIndex = findIndex(task, this.tasks[index].events)
      if (atIndex >= 0) {
        this.task[index].events.splice(atIndex, 1)
        this._reschedule()
      }
    }
  }

  cancelAll (fn) {
    for (let i = 0; i < this.task.length; ++i) {
      removeAllFrom(fn, this.tasks[i])
    }
    this._reschedule()
  }

  // internal API

  _reschedule () {
    if (this.task.length === 0) {
      this._unschedule()
    } else {
      this._scheduleNextRun(this.now())
    }
  }

  _unschedule () {
    this.timer.clearTimer(this.timerId)
    this.timerId = null
  }

  _scheduleNextRun (time) { // eslint-disable-line complexity
    if (this.tasks.length === 0) {
      return
    }

    const nextArrival = this.tasks[0].time

    if (this.timerId === null) {
      this._scheduleNextArrival(nextArrival, time)
    } else if (nextArrival < this.nextArrival) {
      this._unschedule()
      this._scheduleNextArrival(nextArrival, time)
    }
  }

  _scheduleNextArrival (nextArrival, time) {
    this.nextArrival = nextArrival
    const delay = Math.max(0, nextArrival - time)
    this.timerId = this.timer.setTimer(this._runReadyTasksBound, delay)
  }

  _runReadyTasks (time) {
    this.timerId = null
    this._findAndRunTasks(time)
    this._scheduleNextRun(this.now())
  }

  _findAndRunTasks (time) {
    const tasks = this.tasks
    const length = tasks.length
    let i = 0

    while (i < length && tasks[i].time <= time) {
      ++i
    }

    this.tasks = tasks.slice(i)

    for (let j = 0; j < i; ++j) {
      this.tasks = runTasks(tasks[j], this.tasks)
    }
    return this.tasks
  }
}

function runTasks (timeslot, tasks) { // eslint-disable-line complexity
  const events = timeslot.events
  for (let i = 0; i < events.length; ++i) {
    const task = events[i]
    if (task.active) {
      tryRunTask(task)
      if (task.period >= 0) {
        task.time = task.time + task.period
        insertByTime(task, tasks)
      }
    }
  }

  return tasks
}

function removeAllFrom (fn, timeslot) {
  timeslot.events = removeAll(fn, timeslot.events)
}
