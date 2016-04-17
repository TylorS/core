export * from './array'
export * from './function'
export * from './iterable'
export * from './try'

export {Queue} from './Queue'
export {LinkedList} from './LinkedList'

// other functions that don't really have home :'(

export function fatalError (err) {
  setTimeout(() => { throw err }, 0)
}

import {tryRunTask} from './try'
export function defer (task) {
  return Promise.resolve(task).then(tryRunTask)
}

export function isPromise (p) {
  return p !== null && typeof p === 'object' && typeof p.then === 'function'
}
