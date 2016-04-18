import {describe, it} from 'mocha'
import assert from 'assert'

import {from, observe} from '../../src/index'

describe('from', () => {
  it('should support array-like items', () => {
    const expected = [1, 2, 3]

    return observe(x => {
      assert.strictEqual(x, expected.shift())
    }, from([1, 2, 3]))
  })
})
