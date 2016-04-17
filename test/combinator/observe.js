/* global describe, it*/
// import {describe, it} from 'mocha'
import assert from 'assert'
import sinon from 'sinon'

import {observe, of, iterate, take} from '../../src/index'

const sentinel = { value: 'sentinel' }

describe('observe', () => {
  it('should call callback and return a promise', () => {
    const spy = sinon.spy()

    const p = observe(spy, of(sentinel))
      .then(() => {
        assert(spy.calledWith(sentinel))
      })

    assert(p instanceof Promise)

    return p
  })

  it('should call callbck with expected values til end', done => {
    const expected = [0, 1, 2, 3, 4]

    const s = take(5, iterate(x => x + 1, 0))

    observe(x => {
      assert.strictEqual(x, expected.shift())
      if (expected.length === 0) {
        done()
      }
    }, s)
  })
})
