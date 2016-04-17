export class Queue {
  constructor (capPow2) {
    this.capacity = capPow2 || 32
    this.length = 0
    this.head = 0
  }

  push (value) {
    const length = this.length
    this._checkCapacity(length + 1)

    const i = (this.head + length) & (this.capacity - 1)
    this[i] = value
    this.length = length + 1
  }

  shift () {
    const head = this.head
    const value = this[head]

    this[head] = void 0
    this.head = (head + 1) & (this.capacity - 1)
    this.length--
    return value
  }

  isEmpty () {
    return this.length === 0
  }

  length () {
    return this.length
  }

  _checkCapacity (size) {
    if (this.capacity < size) {
      this._ensureCapacity(this.capacity << 1)
    }
  }

  _ensureCapacity (capacity) {
    const oldCapacity = this.capacity
    this.capacity = capacity

    const last = this.head + this.length

    if (last > oldCapacity) {
      copy(this, 0, this, oldCapacity, last & (oldCapacity - 1))
    }
  }
}

function copy (src, srcIndex, dest, destIndex, length) {
  for (let i = 0; i < length; ++i) {
    dest[i + destIndex] = src[i + srcIndex]
    src[i + srcIndex] = void 0
  }
}
