export function binarySearch (t, sortedArray) { // eslint-disable-line complexity
  let lo = 0
  let hi = sortedArray.length
  let mid
  let y

  while (lo < hi) {
    mid = Math.floor((lo + hi) / 2)
    y = sortedArray[mid]

    if (t === y.time) {
      return mid
    } else if (t < y.time) {
      hi = mid
    } else {
      lo = mid + 1
    }
  }
  return hi
}

function newTimeslot (time, events) {
  return { time, events }
}

export function insertByTime (task, timeslots) { // eslint-disable-line complexity
  let l = timeslots.length

  if (l === 0) {
    timeslots.push(newTimeslot(task.time, [task]))
    return
  }

  let i = binarySearch(task.time, timeslots)

  if (i >= l) {
    timeslots.push(newTimeslot(task.time, [task]))
  } else if (task.time === timeslots[i].time) {
    timeslots[i].events.push(task)
  } else {
    timeslots.splice(i, 0, newTimeslot(task.time, [task]))
  }
}
