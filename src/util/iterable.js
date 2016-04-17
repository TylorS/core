export const isIterable = o => typeof o[Symbol.iterator] === 'function'

export const getIterator = o => o[Symbol.iterator]()

export function makeIterable (fn, o) {
  o[Symbol.iterator] = fn
  return o
}
