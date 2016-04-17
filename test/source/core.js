import {describe, it} from 'mocha'
import assert from 'assert'

import {observe, of, empty} from '../../src/index'

const sentinel = { value: 'sentinel' }

describe('of', () => {
  it('should contain one item', () => {
    return observe(x => {
      assert.deepEqual(x, sentinel)
    }, of(sentinel))
  })
})

describe('empty', () => {
  it('should yield no events before end', () => {
    observe(() => { throw new Error('should not be called') }, empty())
  })
})
