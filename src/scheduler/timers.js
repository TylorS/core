import {runAsTask, Task} from './Task/index'

export const timeoutTimer = {
  now: Date.now,
  setTimer: (fn, delay) => setTimeout(fn, delay),
  clearTimer: id => clearTimeout(id)
}

export const nodeTimer = {
  now: Date.now,
  setTimer: (fn, delay) => delay <= 0 ? runAsTask(fn) : setTimeout(fn, delay),
  clearTimer: task => task instanceof Task ? task.cancel() : clearTimeout(task)
}
