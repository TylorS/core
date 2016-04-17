export function tryRunTask (task) {
  try {
    return task.run()
  } catch (e) {
    return task.error(e)
  }
}

export function tryEvent (time, value, sink) {
  try {
    sink.event(time, value)
  } catch (e) {
    sink.error(time, value)
  }
}

export function tryEnd (time, value, sink) {
  try {
    sink.end(time, value)
  } catch (e) {
    sink.error(time, e)
  }
}
