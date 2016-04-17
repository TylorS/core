import {Scheduler} from './Scheduler'
import {timeoutTimer, nodeTimer} from './timers'

const isNode = typeof process === 'object' &&
  typeof process.nextTick === 'function'

export const defaultScheduler = new Scheduler(isNode ? nodeTimer : timeoutTimer)
