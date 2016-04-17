export class ScheduledTask {
  constructor (delay, period, task, scheduler) {
    this.time = delay
    this.period = period
    this.task = task
    this.scheduler = scheduler
    this.active = true
  }

  run () {
    this.task.run(this.time)
  }

  error () {
    this.task.error(this.time)
  }

  cancel () {
    this.scheduler.cancel(this)
    return this.task.dispose()
  }
}
