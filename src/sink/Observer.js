export class Observer {
  constructor (event, end, error, disposable) {
    this._event = event
    this._end = end
    this._error = error
    this._disposable = disposable
    this.active = true
  }

  event (time, value) {
    if (!this.active) { return }
    this._event(value)
  }

  error (time, err) {
    this.active = false
    disposeThen(this._error, this._error, this._disposable, err)
  }

  end (time, value) {
    if (!this.active) { return }
    this.active = false
    disposeThen(this._end, this._error, this._disposable, value)
  }
}

function disposeThen (end, error, disposable, value) {
  return Promise.resolve(disposable.dispose()).then(() => end(value), error)
}
