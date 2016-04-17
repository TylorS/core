import {describe, it} from 'mocha'
import assert from 'assert'

import {Stream} from '../src/index'

const sentinel = { value: 'sentinel' }

describe('Stream', () => {
  it('should have the expected source', () => {
    const s = new Stream(sentinel)
    assert.strictEqual(s.source, sentinel)
  })
})
