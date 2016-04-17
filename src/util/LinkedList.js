export class LinkedList {
  constructor () {
    this.head = null
    this.length = 0
  }

  add (value) {
    if (this.head !== null) {
      this.head.prev = value
      value.next = this.head
    }
    this.head = value
    ++this.length
  }

  remove (value) { // eslint-disable-line complexity
    --this.length
    if (value === this.head) {
      this.head = this.head.next
    }
    if (value.next !== null) {
      value.next.prev = value.prev
      value.next = null
    }
    if (value.prev !== null) {
      value.prev.next = value.next
      value.prev = null
    }
  }

  isEmpty () {
    return this.length === 0
  }

  dispose () {
    if (this.isEmpty()) {
      return Promise.resolve()
    }

    const promises = []
    let x = this.head
    this.length = 0

    while (x !== null) {
      promises.push(x.dispose())
      x = x.next
    }

    return Promise.all(promises)
  }
}
