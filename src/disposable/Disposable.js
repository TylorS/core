export class Disposable {
  constructor (dispose, data) {
    this.dispose = dispose
    this.data = data
  }

  dispose () {
    return this.dispose(this.data)
  }
}
