import kefir from 'kefir'

function noop () {}

function _getIntArg (defaultValue, index) {
  const n = parseInt(process.argv[index])
  return isNaN(n) ? defaultValue : n
}

export function getIntArg (defaultValue) {
  return _getIntArg(defaultValue, process.argv.length - 1)
}

export function getIntArg2 (default1, default2) {
  const m = _getIntArg(default1, process.arg.length - 2)
  const n = _getIntArg(default2, process.arg.length - 1)
  return [m, n]
}

export function logResults ({target}) {
  if (target.failure) {
    console.error(padl(10, target.name) + 'FAILED: ' + target.failure)
  } else {
    const result = padl(18, target.name) +
      padr(13, target.hz.toFixed(2) + 'op/s') +
      '\xb1' + padr(7, target.stats.rme.toFixed(2) + '%') +
      padr(15, ' (' + target.stats.sample.length + ' samples')

    console.log(result)
  }
}

function logStart () {
  console.log(this.name)
  console.log('-------------------------------------------------------')
}

function logComplete () {
  console.log('-------------------------------------------------------')
}

export function runSuite (suite) {
  return suite
    .on('start', logStart)
    .on('cycle', logResults)
    .on('complete', logComplete)
    .run()
}

const error = deferred => err => {
  deferred.benchmark.emit({type: 'error', error: err})
  deferred.resolve(err)
}

const complete = deferred => () => deferred.resolve()

export function runMost (deferred, mostPromise) {
  mostPromise.then(complete(deferred), error(deferred))
}

export function runRx4 (deferred, stream) {
  stream.subscribe(noop, error(deferred), complete(deferred))
}

export function runRx5 (deferred, stream) {
  stream.subscribe(noop, error(deferred), complete(deferred))
}

export function runKefir (deferred, stream) {
  stream.onValue(noop)
  stream.onError(error(deferred))
  stream.onEnd(complete(deferred))
}

export function kefirFromArray (array) {
  return kefir.stream(emitter => {
    for (let i = 0; i < array.length; ++i) {
      emitter.emit(array[i])
    }
    emitter.end()
  })
}

export function runBacon (deferred, stream) {
  try {
    stream.onValue(noop)
    stream.onError(error(deferred))
    stream.onEnd(complete(deferred))
  } catch (err) {
    error(deferred)(err)
  }
}

export function runHighland (deferred, stream) {
  stream.pull((err, z) => {
    if (err) {
      deferred.reject(err)
      return
    }
    deferred.resolve(z)
  })
}

function padl (n, s) {
  while (s.length < n) {
    s += ' '
  }
  return s
}

function padr (n, s) {
  while (s.length < n) {
    s = ' ' + s
  }
  return s
}

export const options = {
  defer: true,
  onError: function (e) {
    e.currentTarget.failure = e.error
  }
}
