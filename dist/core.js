(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define('@most/core', ['exports', '@most/prelude', '@most/multicast', '@most/dom-event'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('@most/prelude'), require('@most/multicast'), require('@most/dom-event'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.prelude, global.multicast, global.domEvent);
    global.mostCore = mod.exports;
  }
})(this, function (exports, _prelude, _multicast, _domEvent) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.tryEnd = exports.tryEvent = exports.tryRunTask = exports.makeIterable = exports.getIterator = exports.isIterable = exports.invoke = exports.insertByTime = exports.binarySearch = exports.LinkedList = exports.Queue = exports.isPromise = exports.defer = exports.fatalError = exports.nodeTimer = exports.timeoutTimer = exports.Scheduler = exports.defaultScheduler = exports.runAsTask = exports.Task = exports.ScheduledTask = exports.PropagateTask = exports.Observer = exports.hasValue = exports.IndexSink = exports.DeferredSink = exports.runSource = exports.withScheduler = exports.withDefaultScheduler = exports.zip = exports.zipArray = exports.constant = exports.tap = exports.transduce = exports.during = exports.skipUntil = exports.takeUntil = exports.switchLatest = exports.skipWhile = exports.takeWhile = exports.take = exports.skip = exports.slice = exports.skipRepeatsWith = exports.skipRepeats = exports.sampleArray = exports.sample = exports.fromPromise = exports.awaitPromises = exports.drain = exports.observe = exports.mergeConcurrently = exports.mergeMapConcurrently = exports.merge = exports.mergeArray = exports.loop = exports.debounce = exports.throttle = exports.join = exports.chain = exports.flatMap = exports.flatMapError = exports.recoverWith = exports.delay = exports.continueWith = exports.concatMap = exports.combine = exports.combineArray = exports.startWith = exports.concat = exports.ap = exports.reduce = exports.scan = exports.map = exports.filter = exports.unfold = exports.throwError = exports.periodic = exports.iterate = exports.generate = exports.fromIterable = exports.fromEvent = exports.fromArray = exports.from = exports.create = exports.never = exports.empty = exports.just = exports.of = exports.Stream = exports.disposable = undefined;

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
  };

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var Stream = function Stream(source) {
    _classCallCheck(this, Stream);

    this.source = source;
  };

  function binarySearch(t, sortedArray) {
    // eslint-disable-line complexity
    var lo = 0;
    var hi = sortedArray.length;
    var mid = void 0;
    var y = void 0;

    while (lo < hi) {
      mid = Math.floor((lo + hi) / 2);
      y = sortedArray[mid];

      if (t === y.time) {
        return mid;
      } else if (t < y.time) {
        hi = mid;
      } else {
        lo = mid + 1;
      }
    }
    return hi;
  }

  function newTimeslot(time, events) {
    return { time: time, events: events };
  }

  function insertByTime(task, timeslots) {
    // eslint-disable-line complexity
    var l = timeslots.length;

    if (l === 0) {
      timeslots.push(newTimeslot(task.time, [task]));
      return;
    }

    var i = binarySearch(task.time, timeslots);

    if (i >= l) {
      timeslots.push(newTimeslot(task.time, [task]));
    } else if (task.time === timeslots[i].time) {
      timeslots[i].events.push(task);
    } else {
      timeslots.splice(i, 0, newTimeslot(task.time, [task]));
    }
  }

  function invoke(fn, args) {
    // eslint-disable-line complexity
    switch (args.length) {
      case 0:
        return fn();
      case 1:
        return fn(args[0]);
      case 2:
        return fn(args[0], args[1]);
      case 3:
        return fn(args[0], args[1], args[2]);
      case 4:
        return fn(args[0], args[1], args[2], args[3]);
      case 5:
        return fn(args[0], args[1], args[2], args[3], args[4]);
      default:
        return fn.apply(void 0, args);
    }
  }

  var isIterable = function isIterable(o) {
    return typeof o[Symbol.iterator] === 'function';
  };

  var getIterator = function getIterator(o) {
    return o[Symbol.iterator]();
  };

  function makeIterable(fn, o) {
    o[Symbol.iterator] = fn;
    return o;
  }

  function tryRunTask(task) {
    try {
      return task.run();
    } catch (e) {
      return task.error(e);
    }
  }

  function tryEvent(time, value, sink) {
    try {
      sink.event(time, value);
    } catch (e) {
      sink.error(time, value);
    }
  }

  function tryEnd(time, value, sink) {
    try {
      sink.end(time, value);
    } catch (e) {
      sink.error(time, e);
    }
  }

  var Queue = function () {
    function Queue(capPow2) {
      _classCallCheck(this, Queue);

      this.capacity = capPow2 || 32;
      this.length = 0;
      this.head = 0;
    }

    _createClass(Queue, [{
      key: 'push',
      value: function push(value) {
        var length = this.length;
        this._checkCapacity(length + 1);

        var i = this.head + length & this.capacity - 1;
        this[i] = value;
        this.length = length + 1;
      }
    }, {
      key: 'shift',
      value: function shift() {
        var head = this.head;
        var value = this[head];

        this[head] = void 0;
        this.head = head + 1 & this.capacity - 1;
        this.length--;
        return value;
      }
    }, {
      key: 'isEmpty',
      value: function isEmpty() {
        return this.length === 0;
      }
    }, {
      key: 'length',
      value: function length() {
        return this.length;
      }
    }, {
      key: '_checkCapacity',
      value: function _checkCapacity(size) {
        if (this.capacity < size) {
          this._ensureCapacity(this.capacity << 1);
        }
      }
    }, {
      key: '_ensureCapacity',
      value: function _ensureCapacity(capacity) {
        var oldCapacity = this.capacity;
        this.capacity = capacity;

        var last = this.head + this.length;

        if (last > oldCapacity) {
          copy(this, 0, this, oldCapacity, last & oldCapacity - 1);
        }
      }
    }]);

    return Queue;
  }();

  function copy(src, srcIndex, dest, destIndex, length) {
    for (var i = 0; i < length; ++i) {
      dest[i + destIndex] = src[i + srcIndex];
      src[i + srcIndex] = void 0;
    }
  }

  var LinkedList = function () {
    function LinkedList() {
      _classCallCheck(this, LinkedList);

      this.head = null;
      this.length = 0;
    }

    _createClass(LinkedList, [{
      key: 'add',
      value: function add(value) {
        if (this.head !== null) {
          this.head.prev = value;
          value.next = this.head;
        }
        this.head = value;
        ++this.length;
      }
    }, {
      key: 'remove',
      value: function remove(value) {
        // eslint-disable-line complexity
        --this.length;
        if (value === this.head) {
          this.head = this.head.next;
        }
        if (value.next !== null) {
          value.next.prev = value.prev;
          value.next = null;
        }
        if (value.prev !== null) {
          value.prev.next = value.next;
          value.prev = null;
        }
      }
    }, {
      key: 'isEmpty',
      value: function isEmpty() {
        return this.length === 0;
      }
    }, {
      key: 'dispose',
      value: function dispose() {
        if (this.isEmpty()) {
          return Promise.resolve();
        }

        var promises = [];
        var x = this.head;
        this.length = 0;

        while (x !== null) {
          promises.push(x.dispose());
          x = x.next;
        }

        return Promise.all(promises);
      }
    }]);

    return LinkedList;
  }();

  // other functions that don't really have home :'(

  function fatalError(err) {
    setTimeout(function () {
      throw err;
    }, 0);
  }

  function defer(task) {
    return Promise.resolve(task).then(tryRunTask);
  }

  function isPromise(p) {
    return p !== null && (typeof p === 'undefined' ? 'undefined' : _typeof(p)) === 'object' && typeof p.then === 'function';
  }

  var PropagateTask = function () {
    function PropagateTask(fn, value, sink) {
      _classCallCheck(this, PropagateTask);

      this.fn = fn;
      this.value = value;
      this.sink = sink;
      this.active = true;
    }

    _createClass(PropagateTask, [{
      key: 'dispose',
      value: function dispose() {
        this.active = false;
      }
    }, {
      key: 'run',
      value: function run(time) {
        if (!this.active) {
          return;
        }
        this.fn(time, this.value, this.sink);
      }
    }, {
      key: 'error',
      value: function error(time, err) {
        if (!this.active) {
          return fatalError(err);
        }
        this.sink.error(time, err);
      }
    }], [{
      key: 'event',
      value: function event(value, sink) {
        return new PropagateTask(_event, value, sink);
      }
    }, {
      key: 'error',
      value: function error(err, sink) {
        return new PropagateTask(_error, err, sink);
      }
    }, {
      key: 'end',
      value: function end(value, sink) {
        return new PropagateTask(_end, value, sink);
      }
    }]);

    return PropagateTask;
  }();

  var _event = function _event(time, value, sink) {
    return sink.event(time, value);
  };

  var _error = function _error(time, err, sink) {
    return sink.error(time, err);
  };

  var _end = function _end(time, value, sink) {
    return sink.end(time, value);
  };

  var ScheduledTask = function () {
    function ScheduledTask(delay, period, task, scheduler) {
      _classCallCheck(this, ScheduledTask);

      this.time = delay;
      this.period = period;
      this.task = task;
      this.scheduler = scheduler;
      this.active = true;
    }

    _createClass(ScheduledTask, [{
      key: 'run',
      value: function run() {
        this.task.run(this.time);
      }
    }, {
      key: 'error',
      value: function error() {
        this.task.error(this.time);
      }
    }, {
      key: 'cancel',
      value: function cancel() {
        this.scheduler.cancel(this);
        return this.task.dispose();
      }
    }]);

    return ScheduledTask;
  }();

  var Task = function () {
    function Task(fn) {
      _classCallCheck(this, Task);

      this.fn = fn;
      this.active = true;
    }

    _createClass(Task, [{
      key: 'run',
      value: function run() {
        if (!this.active) {
          return;
        }
        var fn = this.fn;
        return fn();
      }
    }, {
      key: 'error',
      value: function error(err) {
        throw err;
      }
    }, {
      key: 'cancel',
      value: function cancel() {
        this.active = false;
      }
    }]);

    return Task;
  }();

  function runAsTask(fn) {
    var task = new Task(fn);
    defer(task);
    return task;
  }

  var Scheduler = function () {
    function Scheduler(timer) {
      _classCallCheck(this, Scheduler);

      this.timer = timer;
      this.tasks = [];
      this.timerId = null;
      this.nextArrival = 0;

      var self = this;
      this._runReadyTasksBound = function () {
        self._runReadyTasks(self.now());
      };
    }

    // Public API

    _createClass(Scheduler, [{
      key: 'now',
      value: function now() {
        return this.timer.now();
      }
    }, {
      key: 'asap',
      value: function asap(task) {
        return this.schedule(0, -1, task);
      }
    }, {
      key: 'delay',
      value: function delay(_delay, task) {
        return this.schedule(_delay, -1, task);
      }
    }, {
      key: 'periodic',
      value: function periodic(period, task) {
        return this.schedule(0, period, task);
      }
    }, {
      key: 'schedule',
      value: function schedule(delay, period, task) {
        var now = this.now();
        var st = new ScheduledTask(now + Math.max(0, delay), period, task, this);
        insertByTime(st, this.tasks);
        this._scheduleNextRun(now);
        return st;
      }
    }, {
      key: 'cancel',
      value: function cancel(task) {
        task.active = false;
        var index = binarySearch(task.time, this.tasks);

        if (index >= 0 && index < this.tasks.length) {
          var atIndex = (0, _prelude.findIndex)(task, this.tasks[index].events);
          if (atIndex >= 0) {
            this.task[index].events.splice(atIndex, 1);
            this._reschedule();
          }
        }
      }
    }, {
      key: 'cancelAll',
      value: function cancelAll(fn) {
        for (var i = 0; i < this.task.length; ++i) {
          removeAllFrom(fn, this.tasks[i]);
        }
        this._reschedule();
      }
    }, {
      key: '_reschedule',
      value: function _reschedule() {
        if (this.task.length === 0) {
          this._unschedule();
        } else {
          this._scheduleNextRun(this.now());
        }
      }
    }, {
      key: '_unschedule',
      value: function _unschedule() {
        this.timer.clearTimer(this.timerId);
        this.timerId = null;
      }
    }, {
      key: '_scheduleNextRun',
      value: function _scheduleNextRun(time) {
        // eslint-disable-line complexity
        if (this.tasks.length === 0) {
          return;
        }

        var nextArrival = this.tasks[0].time;

        if (this.timerId === null) {
          this._scheduleNextArrival(nextArrival, time);
        } else if (nextArrival < this.nextArrival) {
          this._unschedule();
          this._scheduleNextArrival(nextArrival, time);
        }
      }
    }, {
      key: '_scheduleNextArrival',
      value: function _scheduleNextArrival(nextArrival, time) {
        this.nextArrival = nextArrival;
        var delay = Math.max(0, nextArrival - time);
        this.timerId = this.timer.setTimer(this._runReadyTasksBound, delay);
      }
    }, {
      key: '_runReadyTasks',
      value: function _runReadyTasks(time) {
        this.timerId = null;
        this._findAndRunTasks(time);
        this._scheduleNextRun(this.now());
      }
    }, {
      key: '_findAndRunTasks',
      value: function _findAndRunTasks(time) {
        var tasks = this.tasks;
        var length = tasks.length;
        var i = 0;

        while (i < length && tasks[i].time <= time) {
          ++i;
        }

        this.tasks = tasks.slice(i);

        for (var j = 0; j < i; ++j) {
          this.tasks = runTasks(tasks[j], this.tasks);
        }
        return this.tasks;
      }
    }]);

    return Scheduler;
  }();

  function runTasks(timeslot, tasks) {
    // eslint-disable-line complexity
    var events = timeslot.events;
    for (var i = 0; i < events.length; ++i) {
      var task = events[i];
      if (task.active) {
        tryRunTask(task);
        if (task.period >= 0) {
          task.time = task.time + task.period;
          insertByTime(task, tasks);
        }
      }
    }

    return tasks;
  }

  function removeAllFrom(fn, timeslot) {
    timeslot.events = (0, _prelude.removeAll)(fn, timeslot.events);
  }

  var timeoutTimer = {
    now: Date.now,
    setTimer: function setTimer(fn, delay) {
      return setTimeout(fn, delay);
    },
    clearTimer: function clearTimer(id) {
      return clearTimeout(id);
    }
  };

  var nodeTimer = {
    now: Date.now,
    setTimer: function setTimer(fn, delay) {
      return delay <= 0 ? runAsTask(fn) : setTimeout(fn, delay);
    },
    clearTimer: function clearTimer(task) {
      return task instanceof Task ? task.cancel() : clearTimeout(task);
    }
  };

  var isNode = (typeof process === 'undefined' ? 'undefined' : _typeof(process)) === 'object' && typeof process.nextTick === 'function';

  var defaultScheduler = new Scheduler(isNode ? nodeTimer : timeoutTimer);

  var Disposable = function () {
    function Disposable(dispose, data) {
      _classCallCheck(this, Disposable);

      this.dispose = dispose;
      this.data = data;
    }

    _createClass(Disposable, [{
      key: 'dispose',
      value: function dispose() {
        return this.dispose(this.data);
      }
    }]);

    return Disposable;
  }();

  var SettableDisposable = function () {
    function SettableDisposable() {
      _classCallCheck(this, SettableDisposable);

      this.disposable = void 0;
      this.disposed = false;
      this.resolve = void 0;

      var self = this;
      this.result = new Promise(function (resolve) {
        self.resolve = resolve;
      });
    }

    _createClass(SettableDisposable, [{
      key: 'setDisposable',
      value: function setDisposable(disposable) {
        if (this.disposable !== void 0) {
          throw new Error('setDisposable called more than once');
        }

        this.disposable = disposable;

        if (this.disposed) {
          this.resolve(disposable.dispose());
        }
      }
    }, {
      key: 'dispose',
      value: function dispose() {
        if (this.disposed) {
          return this.result;
        }
        this.disposed = true;

        if (this.disposable !== void 0) {
          this.result = this.disposable.dispose();
        }

        return this.result;
      }
    }]);

    return SettableDisposable;
  }();

  // helper functions for disposables

  function tryDispose(time, disposable, sink) {
    var result = disposeSafely(disposable);
    return isPromise(result) ? result.catch(function (err) {
      return sink.error(time, err);
    }) : result;
  }

  function once(disposable) {
    return new Disposable(disposeMemoized, memoized(disposable));
  }

  function create(dispose, data) {
    return once(new Disposable(dispose, data));
  }

  function empty$1() {
    return new Disposable(_prelude.id, void 0);
  }

  function all(disposables) {
    return create(disposeAll, disposables);
  }

  function settable() {
    return new SettableDisposable();
  }

  function promised(disposablePromise) {
    return create(disposePromise, disposablePromise);
  }

  function disposeSafely(disposable) {
    try {
      return disposable.dispose();
    } catch (e) {
      return Promise.resolve(e);
    }
  }

  function memoized(disposable) {
    return { disposed: false, disposable: disposable, value: void 0 };
  }

  function disposeMemoized(memoized) {
    if (!memoized.disposed) {
      memoized.disposed = true;
      memoized.value = disposeSafely(memoized.disposable);
      memoized.disposable = void 0;
    }

    return memoized.value;
  }

  function disposeAll(disposables) {
    return Promise.all((0, _prelude.map)(disposeSafely, disposables));
  }

  function disposeOne(disposable) {
    return disposable.dispose();
  }

  function disposePromise(disposablePromise) {
    return disposablePromise.then(disposeOne);
  }

  var disposable = Object.freeze({
    Disposable: Disposable,
    SettableDisposable: SettableDisposable,
    tryDispose: tryDispose,
    once: once,
    create: create,
    empty: empty$1,
    all: all,
    settable: settable,
    promised: promised
  });

  var of = function of(value) {
    return new Stream(new ValueSource(value));
  };
  var just = function just(value) {
    return of(value);
  }; // alias for of
  var empty = function empty() {
    return EMPTY;
  };
  var never = function never() {
    return NEVER;
  };

  var EMPTY = new Stream({
    run: function run(sink, scheduler) {
      var task = PropagateTask.end(void 0, sink);
      scheduler.asap(task);
      return create(function (t) {
        return t.dispose();
      }, task);
    }
  });

  var NEVER = new Stream({
    run: function run() {
      return empty$1();
    }
  });

  var ValueSource = function () {
    function ValueSource(value) {
      _classCallCheck(this, ValueSource);

      this.value = value;
    }

    _createClass(ValueSource, [{
      key: 'run',
      value: function run(sink, scheduler) {
        sink.event(scheduler.now(), this.value);
        sink.end(scheduler.now(), this.value);

        return empty$1();
      }
    }]);

    return ValueSource;
  }();

  var DeferredSink = function () {
    function DeferredSink(sink) {
      _classCallCheck(this, DeferredSink);

      this.sink = sink;
      this.events = [];
      this.length = 0;
      this.active = true;
    }

    _createClass(DeferredSink, [{
      key: 'event',
      value: function event(time, value) {
        if (!this.active) {
          return;
        }
        if (this.length === 0) {
          defer(new PropagateAllTask(this));
        }
        this.evnets[this.length++] = { time: time, value: value };
      }
    }, {
      key: 'error',
      value: function error(time, err) {
        this.active = false;
        defer(new ErrorTask(time, err, this.sink));
      }
    }, {
      key: 'end',
      value: function end(time, value) {
        this.active = false;
        defer(new EndTask(time, value, this.sink));
      }
    }]);

    return DeferredSink;
  }();

  var PropagateAllTask = function () {
    function PropagateAllTask(deferred) {
      _classCallCheck(this, PropagateAllTask);

      this.deferred = deferred;
    }

    _createClass(PropagateAllTask, [{
      key: 'run',
      value: function run() {
        var _deferred = this.deferred;
        var events = _deferred.events;
        var sink = _deferred.sink;

        var event = void 0;

        for (var i = 0, l = this.deferred.length; i < l; ++i) {
          event = events[i];
          sink.event(event.time, event.value);
        }

        this.defered.length = 0;
      }
    }, {
      key: 'error',
      value: function error(err) {
        this.deferred.error(0, err);
      }
    }]);

    return PropagateAllTask;
  }();

  var EndTask = function () {
    function EndTask(time, value, sink) {
      _classCallCheck(this, EndTask);

      this.time = time;
      this.value = value;
      this.sink = sink;
    }

    _createClass(EndTask, [{
      key: 'run',
      value: function run() {
        this.sink.end(this.time, this.value);
      }
    }, {
      key: 'error',
      value: function error(err) {
        this.sink.error(err);
      }
    }]);

    return EndTask;
  }();

  var ErrorTask = function () {
    function ErrorTask(time, error, sink) {
      _classCallCheck(this, ErrorTask);

      this.time = time;
      this.error = error;
      this.sink = sink;
    }

    _createClass(ErrorTask, [{
      key: 'run',
      value: function run() {
        this.sink.error(this.time, this.value);
      }
    }, {
      key: 'error',
      value: function error(err) {
        throw err;
      }
    }]);

    return ErrorTask;
  }();

  var IndexSink = function () {
    function IndexSink(index, sink) {
      _classCallCheck(this, IndexSink);

      this.index = index;
      this.sink = sink;
      this.active = true;
      this.hasValue = false;
      this.value = void 0;
    }

    _createClass(IndexSink, [{
      key: 'event',
      value: function event(time, value) {
        if (!this.active) {
          return;
        }
        this.value = value;
        this.hasValue = true;
        this.sink.event(time, value);
      }
    }, {
      key: 'error',
      value: function error(time, err) {
        this.active = false;
        this.sink.error(time, err);
      }
    }, {
      key: 'end',
      value: function end(time, value) {
        if (!this.active) {
          return;
        }
        this.active = false;
        this.sink.end(time, { index: this.index, value: value });
      }
    }]);

    return IndexSink;
  }();

  function hasValue(sink) {
    return sink.hasValue;
  }

  var Observer = function () {
    function Observer(event, end, error, disposable) {
      _classCallCheck(this, Observer);

      this._event = event;
      this._end = end;
      this._error = error;
      this._disposable = disposable;
      this.active = true;
    }

    _createClass(Observer, [{
      key: 'event',
      value: function event(time, value) {
        if (!this.active) {
          return;
        }
        this._event(value);
      }
    }, {
      key: 'error',
      value: function error(time, err) {
        this.active = false;
        disposeThen(this._error, this._error, this._disposable, err);
      }
    }, {
      key: 'end',
      value: function end(time, value) {
        if (!this.active) {
          return;
        }
        this.active = false;
        disposeThen(this._end, this._error, this._disposable, value);
      }
    }]);

    return Observer;
  }();

  function disposeThen(end, error, disposable, value) {
    return Promise.resolve(disposable.dispose()).then(function () {
      return end(value);
    }, error);
  }

  function create$1(subscribe) {
    return new Stream(new _multicast.MulticastSource(new SubscribeSource(subscribe)));
  }

  var SubscribeSource = function () {
    function SubscribeSource(subscribe) {
      _classCallCheck(this, SubscribeSource);

      this.subscribe = subscribe;
    }

    _createClass(SubscribeSource, [{
      key: 'run',
      value: function run(sink, scheduler) {
        return new Subscription(new DeferredSink(sink), scheduler, this.subscribe);
      }
    }]);

    return SubscribeSource;
  }();

  var Subscription = function () {
    function Subscription(sink, scheduler, subscribe) {
      _classCallCheck(this, Subscription);

      this.sink = sink;
      this.scheduler = scheduler;
      this.active = true;
      this.unsubscribe = this.init(subscribe);
    }

    _createClass(Subscription, [{
      key: 'init',
      value: function init(subscribe) {
        var _this = this;

        var add = function add(value) {
          return _this.add(value);
        };
        var error = function error(err) {
          return _this.error(err);
        };
        var end = function end(value) {
          return _this.end(value);
        };

        try {
          return subscribe(add, end, error);
        } catch (err) {
          error(err);
        }
      }
    }, {
      key: 'dispose',
      value: function dispose() {
        this.active = false;
        if (typeof this.unsubscribe === 'function') {
          return this.unsubscribe.call(void 0);
        }
      }
    }, {
      key: 'add',
      value: function add(value) {
        if (!this.active) {
          return;
        }
        tryEvent(this.scheduler.now(), value, this.sink);
      }
    }, {
      key: 'error',
      value: function error(err) {
        this.active = false;
        this.sink.error(this.scheduler.now(), err);
      }
    }, {
      key: 'end',
      value: function end(value) {
        if (!this.active) {
          return;
        }
        this.active = false;
        tryEnd(this.scheduler.now(), value, this.sink);
      }
    }]);

    return Subscription;
  }();

  function fromArray(array) {
    return new Stream(new ArraySource(array));
  }

  var ArraySource = function () {
    function ArraySource(array) {
      _classCallCheck(this, ArraySource);

      this.array = array;
    }

    _createClass(ArraySource, [{
      key: 'run',
      value: function run(sink, scheduler) {
        return new ArrayProducer(this.array, sink, scheduler);
      }
    }]);

    return ArraySource;
  }();

  var ArrayProducer = function () {
    function ArrayProducer(array, sink, scheduler) {
      _classCallCheck(this, ArrayProducer);

      this.scheduler = scheduler;
      this.task = new PropagateTask(runProducer, array, sink);
      scheduler.asap(this.task);
    }

    _createClass(ArrayProducer, [{
      key: 'dispose',
      value: function dispose() {
        this.task.dispose();
      }
    }]);

    return ArrayProducer;
  }();

  function runProducer(task, array, sink) {
    for (var i = 0, l = array.length; i < l && task.active; ++i) {
      sink.event(0, array[i]);
    }
    var end = function end() {
      return sink.end(0);
    };

    task.active && end();
  }

  function fromIterable(iterable) {
    return new Stream(new IterableSource(iterable));
  }

  var IterableSource = function () {
    function IterableSource(iterable) {
      _classCallCheck(this, IterableSource);

      this.iterable = iterable;
    }

    _createClass(IterableSource, [{
      key: 'run',
      value: function run(sink, scheduler) {
        return new IteratorProducer(getIterator(this.iterable), sink, scheduler);
      }
    }]);

    return IterableSource;
  }();

  var IteratorProducer = function () {
    function IteratorProducer(iterator, sink, scheduler) {
      _classCallCheck(this, IteratorProducer);

      this.scheduler = scheduler;
      this.iterator = iterator;
      this.task = new PropagateTask(runProducer$1, this, sink);
      scheduler.asap(this.task);
    }

    _createClass(IteratorProducer, [{
      key: 'dispose',
      value: function dispose() {
        this.task.dispose();
      }
    }]);

    return IteratorProducer;
  }();

  function runProducer$1(time, _ref, sink) {
    var iterator = _ref.iterator;
    var scheduler = _ref.scheduler;
    var task = _ref.task;

    var x = iterator.next();

    if (x.done) {
      sink.end(time, x.value);
    } else {
      sink.event(time, x.value);
    }

    scheduler.asap(task);
  }

  function from(a) {
    // eslint-disable-line complexity
    if (Array.isArray(a) || (0, _prelude.isArrayLike)(a)) {
      return fromArray(a);
    }

    if (isIterable(a)) {
      return fromIterable(a);
    }

    throw new TypeError('not iterable ' + a);
  }

  var isEventTarget = function isEventTarget(e) {
    return typeof e.addEventListener === 'function' && typeof e.removeEventListener === 'function';
  };

  var isEventEmitter = function isEventEmitter(e) {
    return typeof e.addListener === 'function' && typeof e.removeListener === 'function';
  };

  var fromEvent = (0, _prelude.curry2)(function fromEvent(event, source) {
    var useCapture = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

    if (isEventTarget(source)) {
      return (0, _domEvent.domEvent)(event, source, useCapture);
    } else if (isEventEmitter(source)) {
      return new Stream(EventEmitterSource(event, source));
    } else {
      throw new Error('source must support addEventListener/removeEventListener or addListener/removeListener');
    }
  });

  var EventEmitterSource = function () {
    function EventEmitterSource(event, source) {
      _classCallCheck(this, EventEmitterSource);

      this.event = event;
      this.source = source;
    }

    _createClass(EventEmitterSource, [{
      key: 'run',
      value: function run(sink, scheduler) {
        var dsink = new DeferredSink(sink);

        function addEventVariadic(a) {
          var l = arguments.length;
          if (l > 1) {
            var arr = new Array(l);
            for (var i = 0; i < l; ++i) {
              arr[i] = arguments[i];
            }
            tryEvent(scheduler.now(), arr, dsink);
          } else {
            tryEvent.tryEvent(scheduler.now(), a, dsink);
          }
        }

        this.source.addListener(this.event, addEventVariadic);

        return create(disposeEventEmitter, { target: this, addEventVariadic: addEventVariadic });
      }
    }]);

    return EventEmitterSource;
  }();

  function disposeEventEmitter(_ref2) {
    var target = _ref2.target;
    var addEventVariadic = _ref2.addEventVariadic;

    target.source.removeListener(target.event, addEventVariadic);
  }

  var generate = (0, _prelude.curry2)(function generate(fn, args) {
    return new Stream(new GenerateSource(fn, args));
  });

  var GenerateSource = function () {
    function GenerateSource(fn, args) {
      _classCallCheck(this, GenerateSource);

      this.fn = fn;
      this.args = args;
    }

    _createClass(GenerateSource, [{
      key: 'run',
      value: function run(sink, scheduler) {
        return new Generate(this.fn.apply(void 0, this.args), sink, scheduler);
      }
    }]);

    return GenerateSource;
  }();

  var Generate = function () {
    function Generate(iterator, sink, scheduler) {
      _classCallCheck(this, Generate);

      this.iterator = iterator;
      this.sink = sink;
      this.scheduler = scheduler;
      this.active = true;

      var err = function err(e) {
        return sink.error(scheduler.now(), e);
      };

      Promise.resolve(this).then(next).catch(err);
    }

    _createClass(Generate, [{
      key: 'dispose',
      value: function dispose() {
        this.active = false;
      }
    }]);

    return Generate;
  }();

  var next = function next(generate, x) {
    return generate.active ? handle(generate, generate.iterator.next(x)) : x;
  };

  function handle(generate, _ref3) {
    var done = _ref3.done;
    var value = _ref3.value;

    if (done) {
      return generate.sink.end(generate.scheduler.now(), value);
    }

    return Promise.resolve(value).then(function (x) {
      return emit(x);
    }, function (e) {
      return error$1(e);
    });
  }

  function emit(generate, x) {
    generate.sink.event(generate.scheduler.now(), x);
    return next(generate, x);
  }

  function error$1(generate, e) {
    return handle(generate, generate.iterator.throw(e));
  }

  var iterate = (0, _prelude.curry2)(function iterate(fn, initial) {
    return new Stream(new IterateSource(fn, initial));
  });

  var IterateSource = function () {
    function IterateSource(fn, initial) {
      _classCallCheck(this, IterateSource);

      this.fn = fn;
      this.initial = initial;
    }

    _createClass(IterateSource, [{
      key: 'run',
      value: function run(sink, scheduler) {
        return new Iterate(this.fn, this.initial, sink, scheduler);
      }
    }]);

    return IterateSource;
  }();

  var Iterate = function () {
    function Iterate(fn, initial, sink, scheduler) {
      _classCallCheck(this, Iterate);

      this.fn = fn;
      this.sink = sink;
      this.scheduler = scheduler;
      this.active = true;

      var self = this;
      function err(e) {
        self.sink.error(self.scheduler.now(), e);
      }

      function start(iterate) {
        return stepIterate(iterate, initial);
      }

      Promise.resolve(this).then(start).catch(err);
    }

    _createClass(Iterate, [{
      key: 'dispose',
      value: function dispose() {
        this.active = false;
      }
    }]);

    return Iterate;
  }();

  function stepIterate(iterate, x) {
    iterate.sink.event(iterate.scheduler.now(), x);

    if (!iterate.active) {
      return x;
    }

    var f = iterate.fn;
    return Promise.resolve(f(x)).then(function (y) {
      return continueIterate(iterate, y);
    });
  }

  function continueIterate(iterate, x) {
    return !iterate.active ? iterate.value : stepIterate(iterate, x);
  }

  var periodic = (0, _prelude.curry2)(function periodic(period, value) {
    return new Stream(new _multicast.MulticastSource(new Periodic(period, value)));
  });

  var Periodic = function () {
    function Periodic(period, value) {
      _classCallCheck(this, Periodic);

      this.period = period;
      this.value = value;
    }

    _createClass(Periodic, [{
      key: 'run',
      value: function run(sink, scheduler) {
        var task = scheduler.periodic(this.periodic, new PropagateTask(emit$1, this.value, sink));
        return create(cancelTask, task);
      }
    }]);

    return Periodic;
  }();

  var cancelTask = function cancelTask(task) {
    return task.cancel();
  };
  var emit$1 = function emit$1(time, value, sink) {
    return sink.event(time, value);
  };

  var throwError = function throwError(err) {
    return new Stream(new ErrorSource(err));
  };

  var ErrorSource = function () {
    function ErrorSource(err) {
      _classCallCheck(this, ErrorSource);

      this.err = err;
    }

    _createClass(ErrorSource, [{
      key: 'run',
      value: function run(sink, scheduler) {
        sink.error(scheduler.now(), this.err);
        return empty$1();
      }
    }]);

    return ErrorSource;
  }();

  var unfold = (0, _prelude.curry2)(function unfold(fn, seed) {
    return new Stream(new UnfoldSource(fn, seed));
  });

  var UnfoldSource = function () {
    function UnfoldSource(fn, seed) {
      _classCallCheck(this, UnfoldSource);

      this.fn = fn;
      this.value = seed;
    }

    _createClass(UnfoldSource, [{
      key: 'run',
      value: function run(sink, scheduler) {
        return new Unfold(this.fn, this.value, sink, scheduler);
      }
    }]);

    return UnfoldSource;
  }();

  var Unfold = function () {
    function Unfold(fn, value, sink, scheduler) {
      _classCallCheck(this, Unfold);

      this.fn = fn;
      this.sink = sink;
      this.scheduler = scheduler;
      this.active = true;

      var err = function err(e) {
        return sink.error(scheduler.now(), e);
      };
      var start = function start(unfold) {
        return stepUnfold(unfold, value);
      };

      Promise.resolve(this).then(start).catch(err);
    }

    _createClass(Unfold, [{
      key: 'dispose',
      value: function dispose() {
        this.active = false;
      }
    }]);

    return Unfold;
  }();

  function stepUnfold(unfold, value) {
    return Promise.resolve(unfold.fn(value)).then(function (tuple) {
      return continueUnfold(unfold, tuple);
    });
  }

  function continueUnfold(unfold, _ref4) {
    var value = _ref4.value;
    var done = _ref4.done;

    if (done) {
      unfold.sink.end(unfold.scheduler.now(), value);
      return value;
    }

    unfold.sink.event(unfold.scheduler.now(), value);

    if (!unfold.active) {
      return value;
    }
    return stepUnfold(unfold, value);
  }

  function withDefaultScheduler(fn, source) {
    return withScheduler(fn, source, defaultScheduler);
  }

  function withScheduler(fn, source, scheduler) {
    return new Promise(function (resolve, reject) {
      runSource(fn, source, scheduler, resolve, reject);
    });
  }

  function runSource(fn, source, scheduler, end, error) {
    var disposable = settable();
    var observer = new Observer(fn, end, error, disposable);
    disposable.setDisposable(source.run(observer, scheduler));
  }

  var continueWith = (0, _prelude.curry2)(function (fn, stream) {
    return new Stream(new ContinueWith(fn, stream.source));
  });

  var ContinueWith = function () {
    function ContinueWith(fn, source) {
      _classCallCheck(this, ContinueWith);

      this.fn = fn;
      this.source = source;
    }

    _createClass(ContinueWith, [{
      key: 'run',
      value: function run(sink, scheduler) {
        return new ContinueWithSink(this.fn, this.source, sink, scheduler);
      }
    }]);

    return ContinueWith;
  }();

  var ContinueWithSink = function () {
    function ContinueWithSink(fn, source, sink, scheduler) {
      _classCallCheck(this, ContinueWithSink);

      this.fn = fn;
      this.sink = sink;
      this.scheduler = scheduler;
      this.active = true;
      this.disposable = once(source.run(this, scheduler));
    }

    _createClass(ContinueWithSink, [{
      key: 'event',
      value: function event(time, value) {
        if (!this.active) {
          return;
        }
        this.sink.event(time, value);
      }
    }, {
      key: 'error',
      value: function error(time, err) {
        this.active = false;
        this.sink.error(time, err);
      }
    }, {
      key: 'end',
      value: function end(time, value) {
        if (!this.active) {
          return;
        }

        var result = tryDispose(time, this.disposable, this.sink);
        this.disposable = isPromise(result) ? promised(this._thenContinue(result, value)) : this._continue(this.fn, value);
      }
    }, {
      key: '_thenContinue',
      value: function _thenContinue(p, value) {
        var self = this;
        p.then(function () {
          return self._continue(self.fn, value);
        });
      }
    }, {
      key: '_continue',
      value: function _continue(fn, value) {
        return fn(value).source.run(this.sink, this.scheduler);
      }
    }, {
      key: 'dispose',
      value: function dispose() {
        this.active = false;
        return this.disposable.dispose();
      }
    }]);

    return ContinueWithSink;
  }();

  var concat = (0, _prelude.curry2)(function (left, right) {
    return continueWith(function () {
      return right;
    }, left);
  });
  var startWith = (0, _prelude.curry2)(function (value, stream) {
    return concat(of(value), stream);
  });

  var scan = (0, _prelude.curry3)(function (fn, initial, stream) {
    return startWith(initial, new Stream(new Accumulate(ScanSink, fn, initial, stream.source)));
  });

  var reduce$1 = (0, _prelude.curry3)(function (fn, initial, stream) {
    return withDefaultScheduler(_prelude.noop, new Accumulate(AccumulateSink, fn, initial, stream.source));
  });

  var Accumulate = function () {
    function Accumulate(SinkType, fn, initial, source) {
      _classCallCheck(this, Accumulate);

      this.SinkType = SinkType;
      this.fn = fn;
      this.initial = initial;
      this.source = source;
    }

    _createClass(Accumulate, [{
      key: 'run',
      value: function run(sink, scheduler) {
        return this.source.run(new this.SinkType(this.fn, this.initial, sink), scheduler);
      }
    }]);

    return Accumulate;
  }();

  var ScanSink = function () {
    function ScanSink(fn, initial, sink) {
      _classCallCheck(this, ScanSink);

      this.fn = fn;
      this.value = initial;
      this.sink = sink;
    }

    _createClass(ScanSink, [{
      key: 'event',
      value: function event(time, value) {
        this.value = this.fn(this.value, value);
        this.sink.event(time, this.value);
      }
    }, {
      key: 'error',
      value: function error(time, err) {
        this.sink.error(time, err);
      }
    }, {
      key: 'end',
      value: function end(time, value) {
        this.sink.end(time, value);
      }
    }]);

    return ScanSink;
  }();

  var AccumulateSink = function (_ScanSink) {
    _inherits(AccumulateSink, _ScanSink);

    function AccumulateSink() {
      _classCallCheck(this, AccumulateSink);

      return _possibleConstructorReturn(this, Object.getPrototypeOf(AccumulateSink).apply(this, arguments));
    }

    _createClass(AccumulateSink, [{
      key: 'end',
      value: function end(time, value) {
        this.sink.end(time, this.value);
      }
    }]);

    return AccumulateSink;
  }(ScanSink);

  var filter = (0, _prelude.curry2)(function filter(predicate, stream) {
    return new Stream(Filter.create(predicate, stream.source));
  });

  var Filter = function () {
    function Filter(predicate, source) {
      _classCallCheck(this, Filter);

      this.predicate = predicate;
      this.source = source;
    }

    _createClass(Filter, [{
      key: 'run',
      value: function run(sink, scheduler) {
        return this.source.run(new FilterSink(this.predicate, sink), scheduler);
      }
    }], [{
      key: 'create',
      value: function create(predicate, source) {
        if (source instanceof Filter) {
          return new Filter(and(source.predicate, predicate), source);
        }

        return new Filter(predicate, source);
      }
    }]);

    return Filter;
  }();

  var FilterSink = function () {
    function FilterSink(predicate, sink) {
      _classCallCheck(this, FilterSink);

      this.predicate = predicate;
      this.sink = sink;
    }

    _createClass(FilterSink, [{
      key: 'event',
      value: function event(time, value) {
        if (this.predicate(value)) {
          this.sink.event(time, value);
        }
      }
    }, {
      key: 'error',
      value: function error(time, err) {
        this.sink.error(time, err);
      }
    }, {
      key: 'end',
      value: function end(time, value) {
        this.sink.end(time, value);
      }
    }]);

    return FilterSink;
  }();

  var and = function and(f, g) {
    return function (x) {
      return f(x) && g(x);
    };
  };

  var FilterMap = function () {
    function FilterMap(predicate, fn, source) {
      _classCallCheck(this, FilterMap);

      this.predicate = predicate;
      this.fn = fn;
      this.source = source;
    }

    _createClass(FilterMap, [{
      key: 'run',
      value: function run(sink, scheduler) {
        return this.source.run(new FilterMapSink(this.predicate, this.fn, sink), scheduler);
      }
    }]);

    return FilterMap;
  }();

  var FilterMapSink = function () {
    function FilterMapSink(predicate, fn, sink) {
      _classCallCheck(this, FilterMapSink);

      this.predicate = predicate;
      this.fn = fn;
      this.sink = sink;
    }

    _createClass(FilterMapSink, [{
      key: 'event',
      value: function event(time, value) {
        if (this.predicate(value)) {
          this.sink.event(time, this.fn(value));
        }
      }
    }, {
      key: 'error',
      value: function error(time, err) {
        this.sink.error(time, err);
      }
    }, {
      key: 'end',
      value: function end(time, value) {
        this.sink.end(time, value);
      }
    }]);

    return FilterMapSink;
  }();

  var map$1 = (0, _prelude.curry2)(function map(fn, stream) {
    return new Stream(Map.create(fn, stream.source));
  });

  var Map = function () {
    function Map(fn, source) {
      _classCallCheck(this, Map);

      this.fn = fn;
      this.source = source;
    }

    _createClass(Map, [{
      key: 'run',
      value: function run(sink, scheduler) {
        return this.source.run(new MapSink(this.fn, sink), scheduler);
      }
    }], [{
      key: 'create',
      value: function create(fn, source) {
        // eslint-disable-line complexity
        if (source instanceof Map) {
          return new Map((0, _prelude.compose)(fn, source.fn), source.source);
        }

        if (source instanceof Filter) {
          return new FilterMap(source.predicate, fn, source.source);
        }

        if (source instanceof FilterMap) {
          return new FilterMap(source.predicate, (0, _prelude.compose)(fn, source.fn), source.source);
        }

        return new Map(fn, source);
      }
    }]);

    return Map;
  }();

  var MapSink = function () {
    function MapSink(fn, sink) {
      _classCallCheck(this, MapSink);

      this.fn = fn;
      this.sink = sink;
    }

    _createClass(MapSink, [{
      key: 'event',
      value: function event(time, value) {
        this.sink.event(time, this.fn(value));
      }
    }, {
      key: 'error',
      value: function error(time, err) {
        this.sink.error(time, err);
      }
    }, {
      key: 'end',
      value: function end(time, value) {
        this.sink.end(time, value);
      }
    }]);

    return MapSink;
  }();

  var combineArray = (0, _prelude.curry2)(function (fn, arrayOfStreams) {
    var length = arrayOfStreams.length;
    return length === 0 ? empty() : length === 1 ? map$1(fn, arrayOfStreams[0]) : new Stream(combineSources(fn, arrayOfStreams));
  });

  var combine = (0, _prelude.curry3)(function (fn, arrayOfStreams, stream) {
    return combineArray(fn, arrayOfStreams.concat(stream));
  });

  function combineSources(fn, streams) {
    return new Combine(fn, (0, _prelude.map)(getSource, streams));
  }

  var getSource = function getSource(stream) {
    return stream.source;
  };

  var Combine = function () {
    function Combine(fn, sources) {
      _classCallCheck(this, Combine);

      this.fn = fn;
      this.sources = sources;
    }

    _createClass(Combine, [{
      key: 'run',
      value: function run(sink, scheduler) {
        var length = this.sources.length;
        var disposables = new Array(length);
        var sinks = new Array(sinks);

        var mergeSink = new CombineSink(disposables, sinks, sink, this.fn);
        var indexSink = void 0;
        for (var i = 0; i < length; ++i) {
          indexSink = sinks[i] = new IndexSink(i, mergeSink);
          disposables[i] = this.sources[i].run(indexSink, scheduler);
        }

        return all(disposables);
      }
    }]);

    return Combine;
  }();

  var CombineSink = function () {
    function CombineSink(disposables, sinks, sink, fn) {
      _classCallCheck(this, CombineSink);

      this.sink = sink;
      this.disposables = disposables;
      this.sinks = sinks;
      this.fn = fn;
      this.values = new Array(sinks.length);
      this.ready = false;
      this.activeCount = sinks.length;
    }

    _createClass(CombineSink, [{
      key: 'event',
      value: function event(time, indexedValue) {
        if (!this.ready) {
          this.ready = this.sinks.every(hasValue);
        }

        this.values[indexedValue.index] = indexedValue.index;
        if (this.ready) {
          this.sink.event(time, invoke(this.fn, this.values));
        }
      }
    }, {
      key: 'error',
      value: function error(time, err) {
        this.sink.error(time, err);
      }
    }, {
      key: 'end',
      value: function end(time, indexedValue) {
        tryDispose(time, this.disposables[indexedValue.index], this.sink);
        if (--this.activeCount === 0) {
          this.sink.end(time, indexedValue);
        }
      }
    }]);

    return CombineSink;
  }();

  var ap = (0, _prelude.curry2)(function (fs, stream) {
    return combineArray(_prelude.apply, [fs, stream]);
  });

  var mergeMapConcurrently = (0, _prelude.curry3)(function (fn, concurrency, stream) {
    return new Stream(new MergeConcurrently(fn, concurrency, stream.source));
  });

  var mergeConcurrently = (0, _prelude.curry2)(function (concurrency, stream) {
    return new Stream(new MergeConcurrently(_prelude.id, concurrency, stream.source));
  });

  var MergeConcurrently = function () {
    function MergeConcurrently(fn, concurrency, source) {
      _classCallCheck(this, MergeConcurrently);

      this.fn = fn;
      this.concurrency = concurrency;
      this.source = source;
    }

    _createClass(MergeConcurrently, [{
      key: 'run',
      value: function run(sink, scheduler) {
        return new Outer(this.fn, this.concurrency, this.source, sink, scheduler);
      }
    }]);

    return MergeConcurrently;
  }();

  var Outer = function () {
    function Outer(fn, concurrency, source, sink, scheduler) {
      _classCallCheck(this, Outer);

      this.fn = fn;
      this.concurrency = concurrency;
      this.sink = sink;
      this.scheduler = scheduler;
      this.pending = [];
      this.current = new LinkedList();
      this.disposable = once(source.run(this, scheduler));
      this.active = true;
    }

    _createClass(Outer, [{
      key: 'event',
      value: function event(time, stream) {
        if (this.current.length < this.concurrency) {
          this._startInner(time, stream);
        } else {
          this.pending.push(stream);
        }
      }
    }, {
      key: 'error',
      value: function error(time, err) {
        this.active = false;
        this.sink.error(time, err);
      }
    }, {
      key: 'end',
      value: function end(time, value) {
        this.active = false;
        tryDispose(time, this.disposable, this.sink);
        this._checkEnd(time, value);
      }
    }, {
      key: 'dispose',
      value: function dispose() {
        this.active = false;
        this.pending.length = 0;
        return Promise.all([this.disposable.dispose9(), this.current.dispose()]);
      }
    }, {
      key: '_startInner',
      value: function _startInner(time, stream) {
        var innerSink = new Inner(time, this, this.sink);
        this.current.add(innerSink);
        innerSink.disposable = mapAndRun(this.fn, innerSink, this.scheduler, stream);
      }
    }, {
      key: '_endInner',
      value: function _endInner(time, value, inner) {
        this.current.remove(inner);
        tryDispose(time, inner, this);

        if (this.pending.length === 0) {
          this._checkEnd(time, value);
        } else {
          this._startInner(time, this.pending.shift());
        }
      }
    }, {
      key: '_checkEnd',
      value: function _checkEnd(time, value) {
        if (!this.active && this.current.isEmpty()) {
          this.sink.end(time, value);
        }
      }
    }]);

    return Outer;
  }();

  function mapAndRun(fn, innerSink, scheduler, stream) {
    return fn(stream).source.run(innerSink, scheduler);
  }

  var Inner = function () {
    function Inner(time, outer, sink) {
      _classCallCheck(this, Inner);

      this.prev = this.next = null;
      this.time = time;
      this.outer = outer;
      this.sink = sink;
      this.disposable = void 0;
    }

    _createClass(Inner, [{
      key: 'event',
      value: function event(time, value) {
        this.sink.event(Math.max(time, this.time), value);
      }
    }, {
      key: 'error',
      value: function error(time, err) {
        this.outer.error(Math.max(time, this.time), err);
      }
    }, {
      key: 'end',
      value: function end(time, value) {
        this.outer._endInner(Math.max(time, this.time), value, this);
      }
    }, {
      key: 'dispose',
      value: function dispose() {
        return this.disposable.dispose();
      }
    }]);

    return Inner;
  }();

  var concatMap = (0, _prelude.curry2)(function (fn, stream) {
    return mergeMapConcurrently(fn, 1, stream);
  });

  var delay = (0, _prelude.curry2)(function (dt, stream) {
    return dt <= 0 ? stream : new Stream(new Delay(dt, stream.source));
  });

  var Delay = function () {
    function Delay(dt, source) {
      _classCallCheck(this, Delay);

      this.dt = dt;
      this.source = source;
    }

    _createClass(Delay, [{
      key: 'run',
      value: function run(sink, scheduler) {
        var delaySink = new DelaySink(this.dt, sink, scheduler);
        return all([delaySink, this.source.run(delaySink, scheduler)]);
      }
    }]);

    return Delay;
  }();

  var DelaySink = function () {
    function DelaySink(dt, sink, scheduler) {
      _classCallCheck(this, DelaySink);

      this.dt = dt;
      this.sink = sink;
      this.scheudler = scheduler;
    }

    _createClass(DelaySink, [{
      key: 'event',
      value: function event(time, value) {
        this.schedule.delay(this.dt, PropagateTask.event(value, this.sink));
      }
    }, {
      key: 'end',
      value: function end(time, value) {
        this.scheduler.delay(this.dt, PropagateTask.end(value, this.sinkn));
      }
    }, {
      key: 'error',
      value: function error(time, err) {
        this.sink.error(time, err);
      }
    }]);

    return DelaySink;
  }();

  var recoverWith = (0, _prelude.curry2)(function (fn, stream) {
    return new Stream(new RecoverWith(fn, stream.source));
  });

  var flatMapError = (0, _prelude.curry2)(function (fn, stream) {
    return new Stream(new RecoverWith(fn, stream.source));
  });

  var RecoverWith = function () {
    function RecoverWith(fn, source) {
      _classCallCheck(this, RecoverWith);

      this.fn = fn;
      this.source = source;
    }

    _createClass(RecoverWith, [{
      key: 'run',
      value: function run(sink, scheduler) {
        return new RecoverWithSink(this.fn, this.source, sink, scheduler);
      }
    }]);

    return RecoverWith;
  }();

  var RecoverWithSink = function () {
    function RecoverWithSink(fn, source, sink, scheduler) {
      _classCallCheck(this, RecoverWithSink);

      this.fn = fn;
      this.sink = sink;
      this.scheduler = scheduler;
      this.active = true;
      this.disposable = source.run(this, scheduler);
    }

    _createClass(RecoverWithSink, [{
      key: 'event',
      value: function event(time, value) {
        if (!this.active) {
          return;
        }
        tryEvent(time, value, this.sink);
      }
    }, {
      key: 'error',
      value: function error(time, err) {
        if (!this.active) {
          return;
        }

        // TODO: forward dispose errors
        tryDispose(time, this.disposable, this);

        var _apply = (0, _prelude.apply)(this.fn, err);

        var source = _apply.source;

        this.disposable = source.run(this.sink, this.scheduler);
      }
    }, {
      key: 'end',
      value: function end(time, value) {
        if (!this.active) {
          return;
        }
        tryEnd(time, value, this.sink);
      }
    }, {
      key: 'dispose',
      value: function dispose() {
        this.active = false;
        return this.disposable.dispose();
      }
    }]);

    return RecoverWithSink;
  }();

  var flatMap = (0, _prelude.curry2)(function (fn, stream) {
    return mergeMapConcurrently(fn, Infinity, stream);
  });

  var chain = (0, _prelude.curry2)(function (fn, stream) {
    return mergeMapConcurrently(fn, Infinity, stream);
  });

  var join = function join(stream) {
    return mergeConcurrently(Infinity, stream);
  };

  var throttle = (0, _prelude.curry2)(function (period, stream) {
    return new Stream(new Throttle(period, stream.source));
  });

  var debounce = (0, _prelude.curry2)(function (period, stream) {
    return new Stream(new Debounce(period, stream.source));
  });

  var Throttle = function () {
    function Throttle(period, source) {
      _classCallCheck(this, Throttle);

      this.dt = period;
      this.source = source;
    }

    _createClass(Throttle, [{
      key: 'run',
      value: function run(sink, scheduler) {
        return this.source.run(new ThrottleSink(this.dt, sink), scheduler);
      }
    }]);

    return Throttle;
  }();

  var ThrottleSink = function () {
    function ThrottleSink(dt, sink) {
      _classCallCheck(this, ThrottleSink);

      this.dt = dt;
      this.sink = sink;
      this.time = 0;
    }

    _createClass(ThrottleSink, [{
      key: 'event',
      value: function event(time, value) {
        if (time >= this.time) {
          this.time = time + this.dt;
          this.sink.event(time, value);
        }
      }
    }, {
      key: 'error',
      value: function error(time, err) {
        this.sink.error(time, err);
      }
    }, {
      key: 'end',
      value: function end(time, value) {
        this.sink.end(time, value);
      }
    }]);

    return ThrottleSink;
  }();

  var Debounce = function () {
    function Debounce(dt, source) {
      _classCallCheck(this, Debounce);

      this.dt = dt;
      this.source = source;
    }

    _createClass(Debounce, [{
      key: 'run',
      value: function run(sink, scheduler) {
        return new DebounceSink(this.dt, this.source, sink, scheduler);
      }
    }]);

    return Debounce;
  }();

  var DebounceSink = function () {
    function DebounceSink(dt, source, sink, scheduler) {
      _classCallCheck(this, DebounceSink);

      this.dt = dt;
      this.sink = sink;
      this.scheduler = scheduler;
      this.value = void 0;
      this.timer = null;

      var sourceDisposable = source.run(this, scheduler);
      this.diposable = all([this, sourceDisposable]);
    }

    _createClass(DebounceSink, [{
      key: 'event',
      value: function event(time, value) {
        this._clearTimer();
        this.value = value;
        this.timer = this.scheduler.delay(this.dt, PropagateTask.event(value, this.sink));
      }
    }, {
      key: 'error',
      value: function error(time, err) {
        this._clearTimer();
        this.sink.error(time, err);
      }
    }, {
      key: 'end',
      value: function end(time, value) {
        if (this._clearTimer()) {
          this.sink.event(time, this.value);
          this.value = void 0;
        }
        this.sink.end(time, value);
      }
    }, {
      key: '_clearTimer',
      value: function _clearTimer() {
        if (this.timer === null) {
          return false;
        }
        this.timer.cancel();
        this.timer = null;
        return true;
      }
    }]);

    return DebounceSink;
  }();

  var loop = (0, _prelude.curry3)(function (stepper, seed, stream) {
    return new Stream(new Loop(stepper, seed, stream.source));
  });

  var Loop = function () {
    function Loop(stepper, seed, source) {
      _classCallCheck(this, Loop);

      this.stepper = stepper;
      this.seed = seed;
      this.source = source;
    }

    _createClass(Loop, [{
      key: 'run',
      value: function run(sink, scheduler) {
        return this.source.run(new LoopSink(this.stepper, this.seed, sink), scheduler);
      }
    }]);

    return Loop;
  }();

  var LoopSink = function () {
    function LoopSink(stepper, seed, sink) {
      _classCallCheck(this, LoopSink);

      this.step = stepper;
      this.seed = seed;
      this.sink = sink;
    }

    _createClass(LoopSink, [{
      key: 'event',
      value: function event(time, x) {
        var _step = this.step(this.seed, x);

        var seed = _step.seed;
        var value = _step.value;

        this.seed = seed;
        this.sink.event(time, value);
      }
    }, {
      key: 'error',
      value: function error(time, err) {
        this.sink.error(time, err);
      }
    }, {
      key: 'end',
      value: function end(time) {
        this.sink.end(time, this.seed);
      }
    }]);

    return LoopSink;
  }();

  function mergeArray(arrayOfStreams) {
    var length = arrayOfStreams.length;
    return length === 0 ? empty() : length === 1 ? arrayOfStreams[0] : new Stream(mergeSources(arrayOfStreams));
  }

  var merge = (0, _prelude.curry2)(function (stream1, stream2) {
    return mergeArray([stream1, stream2]);
  });

  function mergeSources(arrayOfStreams) {
    return new Merge((0, _prelude.reduce)(appendSources, [], arrayOfStreams));
  }

  function appendSources(sources, stream) {
    var source = stream.source;
    return source instanceof Merge ? sources.concat(source.sources) : sources.concat(source);
  }

  var Merge = function () {
    function Merge(sources) {
      _classCallCheck(this, Merge);

      this.sources = sources;
    }

    _createClass(Merge, [{
      key: 'run',
      value: function run(sink, scheduler) {
        var length = this.sources.length;
        var disposables = Array(length);
        var sinks = Array(length);

        var mergeSink = new MergeSink(disposables, sinks, sink);

        var indexSink = void 0;
        for (var i = 0; i < length; ++i) {
          indexSink = sinks[i] = new IndexSink(i, mergeSink);
          disposables[i] = this.sources[i].run(indexSink, scheduler);
        }

        return all(disposables);
      }
    }]);

    return Merge;
  }();

  var MergeSink = function () {
    function MergeSink(disposables, sinks, sink) {
      _classCallCheck(this, MergeSink);

      this.sink = sink;
      this.disposables = disposables;
      this.activeCount = sinks.length;
    }

    _createClass(MergeSink, [{
      key: 'event',
      value: function event(time, _ref5) {
        var value = _ref5.value;

        this.sink.event(time, value);
      }
    }, {
      key: 'error',
      value: function error(time, err) {
        this.sink.error(time, err);
      }
    }, {
      key: 'end',
      value: function end(time, _ref6) {
        var index = _ref6.index;
        var value = _ref6.value;

        tryDispose(time, this.disposables[index], this.sink);
        if (--this.activeCount === 0) {
          this.sink.end(time, value);
        }
      }
    }]);

    return MergeSink;
  }();

  var observe = (0, _prelude.curry2)(function (fn, stream) {
    return withDefaultScheduler(fn, stream.source);
  });

  var drain = function drain(stream) {
    return withDefaultScheduler(_prelude.noop, stream.source);
  };

  var awaitPromises = function awaitPromises(stream) {
    return new Stream(new Await(stream.source));
  };
  var fromPromise = function fromPromise(promise) {
    return awaitPromises(of(promise));
  };

  var Await = function () {
    function Await(source) {
      _classCallCheck(this, Await);

      this.source = source;
    }

    _createClass(Await, [{
      key: 'run',
      value: function run(sink, scheduler) {
        return this.source.run(new AwaitSink(sink, scheduler), scheduler);
      }
    }]);

    return Await;
  }();

  var AwaitSink = function () {
    function AwaitSink(sink, scheduler) {
      _classCallCheck(this, AwaitSink);

      this.sink = sink;
      this.scheduler = scheduler;
      this.queue = Promise.resolve();

      this._eventBound = function (x) {
        return sink.event(scheduler.now(), x);
      };
      this._errorBound = function (e) {
        return sink.error(scheduler.now(), e);
      };
      this._endBound = function (x) {
        return sink.end(scheduler.now(), x);
      };
    }

    _createClass(AwaitSink, [{
      key: 'event',
      value: function event(time, promise) {
        var self = this;
        this.queue = this.queue.then(function () {
          return self._event(promise);
        }).catch(this._errorBound);
      }
    }, {
      key: 'error',
      value: function error(time, err) {
        var self = this;
        this.queue = this.queue.then(function () {
          return self._errorBound(err);
        }).catch(fatalError);
      }
    }, {
      key: 'end',
      value: function end(time, value) {
        var self = this;
        this.queue = this.queue.then(function () {
          return self._end(value);
        }).catch(this._errorBound);
      }
    }, {
      key: '_event',
      value: function _event(promise) {
        return promise.then(this._eventBound);
      }
    }, {
      key: '_end',
      value: function _end(value) {
        return Promise.resolve(value).then(this._endBound);
      }
    }]);

    return AwaitSink;
  }();

  var sample = (0, _prelude.curry3)(function (fn, sampler, stream) {
    return new Stream(new SampleSource(fn, sampler, stream));
  });

  var arrayId = function arrayId() {
    for (var _len = arguments.length, values = Array(_len), _key = 0; _key < _len; _key++) {
      values[_key] = arguments[_key];
    }

    return values;
  };

  var sampleArray = (0, _prelude.curry3)(function (fn, sampler, arrayOfStreams) {
    return sample(fn, sampler, combineArray(arrayId, arrayOfStreams));
  });

  var SampleSource = function () {
    function SampleSource(fn, sampler, stream) {
      _classCallCheck(this, SampleSource);

      this.fn = fn;
      this.sampler = sampler.source;
      this.source = stream.source;
    }

    _createClass(SampleSource, [{
      key: 'run',
      value: function run(sink, scheduler) {
        var sampleSink = new SampleSink(this.fn, this.source, sink);
        var samplerDisposable = this.sampler.run(sampleSink, scheduler);
        var sourceDisposable = this.source.run(sampleSink.hold, scheduler);

        return {
          dispose: function dispose() {
            return Promise.all([samplerDisposable.dispose(), sourceDisposable.dispose()]);
          }
        };
      }
    }]);

    return SampleSource;
  }();

  var SampleSink = function () {
    function SampleSink(fn, source, sink) {
      _classCallCheck(this, SampleSink);

      this.fn = fn;
      this.source = source;
      this.sink = sink;
      this.active = false;
      this.hold = new SampleHold(this);
    }

    _createClass(SampleSink, [{
      key: 'event',
      value: function event(time, value) {
        if (this.hold.hasValue) {
          this.sink.event(time, this.fn(value, this.hold.value));
        }
      }
    }, {
      key: 'error',
      value: function error(time, err) {
        return this.sink.error(time, err);
      }
    }, {
      key: 'end',
      value: function end(time, value) {
        return this.sink.end(time, value);
      }
    }]);

    return SampleSink;
  }();

  var SampleHold = function () {
    function SampleHold(sink) {
      _classCallCheck(this, SampleHold);

      this.sink = sink;
      this.hasValue = false;
    }

    _createClass(SampleHold, [{
      key: 'event',
      value: function event(time, value) {
        this.value = value;
        this.hasValue = true;
      }
    }, {
      key: 'end',
      value: function end() {}
    }, {
      key: 'error',
      value: function error(time, err) {
        this.sink.error(time, err);
      }
    }]);

    return SampleHold;
  }();

  var skipRepeats = function skipRepeats(stream) {
    return new Stream(new SkipRepeats(same, stream.source));
  };

  var skipRepeatsWith = (0, _prelude.curry2)(function skipRepeatsWith(equals, stream) {
    return new Stream(new SkipRepeats(equals, stream.source));
  });

  var SkipRepeats = function () {
    function SkipRepeats(equals, source) {
      _classCallCheck(this, SkipRepeats);

      this.equals = equals;
      this.source = source;
    }

    _createClass(SkipRepeats, [{
      key: 'run',
      value: function run(sink, scheduler) {
        return this.source.run(new SkipRepeatsSink(this.equals, sink), scheduler);
      }
    }]);

    return SkipRepeats;
  }();

  var SkipRepeatsSink = function () {
    function SkipRepeatsSink(equals, sink) {
      _classCallCheck(this, SkipRepeatsSink);

      this.equals = equals;
      this.sink = sink;
      this.value === void 0;
      this.init = true;
    }

    _createClass(SkipRepeatsSink, [{
      key: 'event',
      value: function event(time, value) {
        if (this.init) {
          this.init = false;
          this.value = value;
          this.sink.event(time, value);
        } else if (!this.equals(this.value, value)) {
          this.value = value;
          this.sink.event(time, value);
        }
      }
    }, {
      key: 'error',
      value: function error(time, err) {
        this.sink.error(time, err);
      }
    }, {
      key: 'end',
      value: function end(time, value) {
        this.sink.end(time, value);
      }
    }]);

    return SkipRepeatsSink;
  }();

  var same = function same(a, b) {
    return a === b;
  };

  var slice = (0, _prelude.curry3)(function slice(start, end, stream) {
    return end <= start ? empty() : new Stream(new Slice(start, end, stream.source));
  });

  var skip = (0, _prelude.curry2)(function skip(n, stream) {
    return new Stream(new Slice(n, Infinity, stream.source));
  });

  var take = (0, _prelude.curry2)(function take(n, stream) {
    return new Stream(new Slice(0, n, stream.source));
  });

  var takeWhile = (0, _prelude.curry2)(function takeWhile(p, stream) {
    return new Stream(new TakeWhile(p, stream.source));
  });

  var skipWhile = (0, _prelude.curry2)(function skipWhile(p, stream) {
    return new Stream(new SkipWhile(p, stream.source));
  });

  var Slice = function () {
    function Slice(min, max, source) {
      _classCallCheck(this, Slice);

      this.skip = min;
      this.take = max - min;
      this.source = source;
    }

    _createClass(Slice, [{
      key: 'run',
      value: function run(sink, scheduler) {
        return new SliceSink(this.skip, this.take, this.source, sink, scheduler);
      }
    }]);

    return Slice;
  }();

  var SliceSink = function () {
    function SliceSink(skip, take, source, sink, scheduler) {
      _classCallCheck(this, SliceSink);

      this.skip = skip;
      this.take = take;
      this.sink = sink;
      this.disposable = once(source.run(this, scheduler));
    }

    _createClass(SliceSink, [{
      key: 'event',
      value: function event(time, value) {
        // eslint-disable-line complexity
        if (this.skip > 0) {
          this.skip -= 1;
          return;
        }

        if (this.take === 0) {
          return;
        }

        this.take -= 1;
        this.sink.event(time, value);
        if (this.take === 0) {
          this.dispose();
          this.sink.end(time, value);
        }
      }
    }, {
      key: 'error',
      value: function error(time, err) {
        this.sink.error(time, err);
      }
    }, {
      key: 'end',
      value: function end(time, value) {
        this.sink.end(time, value);
      }
    }, {
      key: 'dispose',
      value: function dispose() {
        return this.disposable.dispose();
      }
    }]);

    return SliceSink;
  }();

  var TakeWhile = function () {
    function TakeWhile(p, source) {
      _classCallCheck(this, TakeWhile);

      this.p = p;
      this.source = source;
    }

    _createClass(TakeWhile, [{
      key: 'run',
      value: function run(sink, scheduler) {
        return new TakeWhileSink(this.p, this.source, sink, scheduler);
      }
    }]);

    return TakeWhile;
  }();

  var TakeWhileSink = function () {
    function TakeWhileSink(p, source, sink, scheduler) {
      _classCallCheck(this, TakeWhileSink);

      this.p = p;
      this.source = source;
      this.sink = sink;
      this.disposable = once(source.run(this, scheduler));
    }

    _createClass(TakeWhileSink, [{
      key: 'error',
      value: function error(time, err) {
        this.sink.error(time, err);
      }
    }, {
      key: 'end',
      value: function end(time, value) {
        this.sink.enf(time, value);
      }
    }, {
      key: 'event',
      value: function event(time, value) {
        if (!this.active) {
          return;
        }

        this.active = this.p(value);
        if (this.active) {
          this.sink.event(time, value);
        } else {
          this.dispose();
          this.sink.end(time, value);
        }
      }
    }, {
      key: 'dispose',
      value: function dispose() {
        this.disposable.dispose();
      }
    }]);

    return TakeWhileSink;
  }();

  var SkipWhile = function () {
    function SkipWhile(p, source) {
      _classCallCheck(this, SkipWhile);

      this.p = p;
      this.source = source;
    }

    _createClass(SkipWhile, [{
      key: 'run',
      value: function run(sink, scheduler) {
        return this.source.run(new SkipWhileSink(this.p, sink), scheduler);
      }
    }]);

    return SkipWhile;
  }();

  var SkipWhileSink = function () {
    function SkipWhileSink(p, sink) {
      _classCallCheck(this, SkipWhileSink);

      this.p = p;
      this.sink = sink;
    }

    _createClass(SkipWhileSink, [{
      key: 'error',
      value: function error(time, err) {
        this.sink.error(time, err);
      }
    }, {
      key: 'end',
      value: function end(time, value) {
        this.sink.enf(time, value);
      }
    }, {
      key: 'event',
      value: function event(time, value) {
        if (this.skipping) {
          this.skipping = this.p(value);
          if (this.skipping) {
            return;
          }
        }

        this.sink.event(time, value);
      }
    }]);

    return SkipWhileSink;
  }();

  var switchLatest = function switchLatest(stream) {
    return new Stream(new Switch(stream.source));
  };

  var Switch = function () {
    function Switch(source) {
      _classCallCheck(this, Switch);

      this.source = source;
    }

    _createClass(Switch, [{
      key: 'run',
      value: function run(sink, scheduler) {
        var switchSink = new SwitchSink(sink, scheduler);
        return all(switchSink, this.source.run(switchSink, scheduler));
      }
    }]);

    return Switch;
  }();

  var SwitchSink = function () {
    function SwitchSink(sink, scheduler) {
      _classCallCheck(this, SwitchSink);

      this.sink = sink;
      this.scheduler = scheduler;
      this.current = null;
      this.ended = false;
    }

    _createClass(SwitchSink, [{
      key: 'event',
      value: function event(time, stream) {
        this._disposeCurrent(time); // TODO capture result of dipose
        this.current = new Segment(time, Infinity, this, this.sink);
        this.current.disposable = stream.source.run(this.current, this.scheduler);
      }
    }, {
      key: 'error',
      value: function error(time, err) {
        this.ended = true;
        this.sink.error(time, err);
      }
    }, {
      key: 'end',
      value: function end(time, value) {
        this.ended = true;
        this._checkEnd(time, value);
      }
    }, {
      key: 'dispose',
      value: function dispose() {
        return this._disposeCurrent(0);
      }
    }, {
      key: '_disposeCurrent',
      value: function _disposeCurrent(time) {
        if (this.current !== null) {
          this.current._dipose(time);
        }
      }
    }, {
      key: '_disposeInner',
      value: function _disposeInner(time, inner) {
        inner._dipose(time); // TODO capture the result of dispose
        if (inner === this.current) {
          this.current = null;
        }
      }
    }, {
      key: '_checkEnd',
      value: function _checkEnd(time, value) {
        if (this.ended && this.current === null) {
          this.sink.end(time, value);
        }
      }
    }, {
      key: '_endInner',
      value: function _endInner(time, value, inner) {
        this._disposeInner(time, inner);
        this._checkEnd(time, value);
      }
    }, {
      key: '_errorInner',
      value: function _errorInner(time, err, inner) {
        this._disposeInner(time, inner);
        this.sink.error(time, err);
      }
    }]);

    return SwitchSink;
  }();

  var Segment = function () {
    function Segment(min, max, outer, sink) {
      _classCallCheck(this, Segment);

      this.min = min;
      this.max = max;
      this.outer = outer;
      this.sink = sink;
      this.disposable = empty$1();
    }

    _createClass(Segment, [{
      key: 'event',
      value: function event(time, value) {
        if (time < this.max) {
          this.sink.event(Math.max(time, this.min), value);
        }
      }
    }, {
      key: 'error',
      value: function error(time, err) {
        this.outer._errorInner(Math.max(time, this.min), err, this);
      }
    }, {
      key: 'end',
      value: function end(time, value) {
        this.outer._endInner(Math.max(time, this.min), value, this);
      }
    }, {
      key: '_dispose',
      value: function _dispose(time) {
        this.max = time;
        tryDispose(time, this.disposable, this.sink);
      }
    }]);

    return Segment;
  }();

  var takeUntil = (0, _prelude.curry2)(function (signal, stream) {
    return new Stream(new Until(signal.source, stream.source));
  });

  var skipUntil = (0, _prelude.curry2)(function (signal, stream) {
    return new Stream(new Since(signal.source, stream.source));
  });

  var during = (0, _prelude.curry2)(function (timeWindow, stream) {
    return takeUntil(join(timeWindow), skipUntil(timeWindow, stream));
  });

  var Until = function () {
    function Until(maxSignal, source) {
      _classCallCheck(this, Until);

      this.maxSignal = maxSignal;
      this.source = source;
    }

    _createClass(Until, [{
      key: 'run',
      value: function run(sink, scheduler) {
        var min = new Bound(-Infinity, sink);
        var max = new UpperBound(this.maxSignal, sink, scheduler);
        var disposable = this.source.run(new TimeWindowSink(min, max, sink), scheduler);

        return all([min, max, disposable]);
      }
    }]);

    return Until;
  }();

  var Since = function () {
    function Since(minSignal, source) {
      _classCallCheck(this, Since);

      this.minSignal = minSignal;
      this.source = source;
    }

    _createClass(Since, [{
      key: 'run',
      value: function run(sink, scheduler) {
        var min = new LowerBound(this.minSignal, sink, scheduler);
        var max = new Bound(Infinity, sink);
        var disposable = this.source.run(new TimeWindowSink(min, max, sink), scheduler);

        return all([min, max, disposable]);
      }
    }]);

    return Since;
  }();

  var Bound = function () {
    function Bound(value, sink) {
      _classCallCheck(this, Bound);

      this.value = value;
      this.sink = sink;
    }

    _createClass(Bound, [{
      key: 'event',
      value: function event() {
        return void 0;
      }
    }, {
      key: 'error',
      value: function error(time, err) {
        this.sink.error(time, err);
      }
    }, {
      key: 'end',
      value: function end() {
        return void 0;
      }
    }, {
      key: 'dispose',
      value: function dispose() {
        return void 0;
      }
    }]);

    return Bound;
  }();

  var TimeWindowSink = function () {
    function TimeWindowSink(min, max, sink) {
      _classCallCheck(this, TimeWindowSink);

      this.min = min;
      this.max = max;
      this.sink = sink;
    }

    _createClass(TimeWindowSink, [{
      key: 'event',
      value: function event(time, value) {
        if (time >= this.min.value && time < this.max.value) {
          this.sink.event(time, value);
        }
      }
    }, {
      key: 'error',
      value: function error(time, err) {
        this.sink.error(time, err);
      }
    }, {
      key: 'end',
      value: function end(time, value) {
        this.sink.end(time, value);
      }
    }]);

    return TimeWindowSink;
  }();

  var LowerBound = function () {
    function LowerBound(signal, sink, scheduler) {
      _classCallCheck(this, LowerBound);

      this.value = Infinity;
      this.sink = sink;
      this.disposable = signal.run(this, scheduler);
    }

    _createClass(LowerBound, [{
      key: 'event',
      value: function event(time /*, value */) {
        if (time < this.value) {
          this.value = time;
        }
      }
    }, {
      key: 'error',
      value: function error(time, err) {
        this.sink.error(time, err);
      }
    }, {
      key: 'end',
      value: function end() {
        return void 0;
      }
    }, {
      key: 'dispose',
      value: function dispose() {
        return this.disposable.dispose();
      }
    }]);

    return LowerBound;
  }();

  var UpperBound = function () {
    function UpperBound(signal, sink, scheduler) {
      _classCallCheck(this, UpperBound);

      this.value = Infinity;
      this.sink = sink;
      this.disposable = signal.run(this, scheduler);
    }

    _createClass(UpperBound, [{
      key: 'event',
      value: function event(time, value) {
        if (time < this.value) {
          this.value = time;
          this.sink.end(time, value);
        }
      }
    }, {
      key: 'error',
      value: function error(time, err) {
        this.sink.error(time, err);
      }
    }, {
      key: 'end',
      value: function end() {
        return void 0;
      }
    }, {
      key: 'dispose',
      value: function dispose() {
        return this.disposable.dispose();
      }
    }]);

    return UpperBound;
  }();

  var transduce = (0, _prelude.curry2)(function (transducer, stream) {
    return new Stream(new Transduce(transducer, stream.source));
  });

  var Transduce = function () {
    function Transduce(transducer, source) {
      _classCallCheck(this, Transduce);

      this.transducer = transducer;
      this.source = source;
    }

    _createClass(Transduce, [{
      key: 'run',
      value: function run(sink, scheduler) {
        var xf = this.transducer(new Transformer(sink));
        return this.source.run(new TransduceSink(getTxHandler(xf), sink), scheduler);
      }
    }]);

    return Transduce;
  }();

  var TransduceSink = function () {
    function TransduceSink(adapter, sink) {
      _classCallCheck(this, TransduceSink);

      this.xf = adapter;
      this.sink = sink;
    }

    _createClass(TransduceSink, [{
      key: 'event',
      value: function event(time, value) {
        var next = this.xf.step(time, value);

        return this.xf.isReduced(next) ? this.sink.end(time, this.xf.getResult(next)) : next;
      }
    }, {
      key: 'error',
      value: function error(time, err) {
        return this.sink.error(time, err);
      }
    }, {
      key: 'end',
      value: function end(time, value) {
        return this.xf.result(value);
      }
    }]);

    return TransduceSink;
  }();

  var Transformer = function () {
    function Transformer(sink) {
      _classCallCheck(this, Transformer);

      this.time = -Infinity;
      this.sink = sink;
    }

    _createClass(Transformer, [{
      key: '@@transducer/init',
      value: function transducerInit() {
        return void 0;
      }
    }, {
      key: '@@transducer/step',
      value: function transducerStep(time, value) {
        if (!isNaN(time)) {
          this.time = Math.max(time, this.time);
        }
        return this.sink.event(this.time, value);
      }
    }, {
      key: '@@transducer/result',
      value: function transducerResult(value) {
        return this.sink.end(this.time, value);
      }
    }]);

    return Transformer;
  }();

  function getTxHandler(tx) {
    return typeof tx['@@transducer/step'] === 'function' ? new TxAdapter(tx) : new LegacyTxAdapter(tx);
  }

  var TxAdapter = function () {
    function TxAdapter(tx) {
      _classCallCheck(this, TxAdapter);

      this.tx = tx;
    }

    _createClass(TxAdapter, [{
      key: 'step',
      value: function step(time, value) {
        return this.tx['@@transducer/step'](time, value);
      }
    }, {
      key: 'result',
      value: function result(value) {
        return this.tx['@@transducer/result'](value);
      }
    }, {
      key: 'isReduced',
      value: function isReduced(value) {
        return value !== null && value['@@transducer/reduced'];
      }
    }, {
      key: 'getResult',
      value: function getResult(value) {
        return value['@@transducer/value'];
      }
    }]);

    return TxAdapter;
  }();

  var LegacyTxAdapter = function () {
    function LegacyTxAdapter(tx) {
      _classCallCheck(this, LegacyTxAdapter);

      this.tx = tx;
    }

    _createClass(LegacyTxAdapter, [{
      key: 'step',
      value: function step(time, value) {
        return this.tx.step(time, value);
      }
    }, {
      key: 'result',
      value: function result(value) {
        return this.tx.result(value);
      }
    }, {
      key: 'isReduced',
      value: function isReduced(value) {
        return value !== null && value.__transducers_reduced__;
      }
    }, {
      key: 'getResult',
      value: function getResult(value) {
        return value.value;
      }
    }]);

    return LegacyTxAdapter;
  }();

  var tap = (0, _prelude.curry2)(function (fn, stream) {
    return map$1(function (x) {
      fn(x);return x;
    }, stream);
  });

  var constant = (0, _prelude.curry2)(function (value, stream) {
    return map$1(function () {
      return value;
    }, stream);
  });

  var zipArray = (0, _prelude.curry2)(function (fn, arrayOfStreams) {
    var length = arrayOfStreams.length;
    return length === 0 ? empty() : length === 1 ? map$1(fn, arrayOfStreams[0]) : new Stream(new Zip(fn, (0, _prelude.map)(getSource$1, arrayOfStreams)));
  });

  var zip = (0, _prelude.curry3)(function (fn, arrayOfStreams, stream) {
    return zipArray(fn, arrayOfStreams.concat(stream));
  });

  var getSource$1 = function getSource$1(_ref7) {
    var source = _ref7.source;
    return source;
  };

  var Zip = function () {
    function Zip(fn, sources) {
      _classCallCheck(this, Zip);

      this.fn = fn;
      this.sources = sources;
    }

    _createClass(Zip, [{
      key: 'run',
      value: function run(sink, scheduler) {
        var length = this.sources.length;
        var disposables = Array(length);
        var sinks = Array(length);
        var buffers = Array(length);

        var zipSink = new ZipSink(this.fn, buffers, sinks, sink);

        var indexSink = void 0;
        for (var i = 0; i < length; ++i) {
          buffers[i] = new Queue();
          indexSink = sinks[i] = new IndexSink(i, zipSink);
          disposables[i] = this.sources[i].run(indexSink, scheduler);
        }

        return all(disposables);
      }
    }]);

    return Zip;
  }();

  var ZipSink = function () {
    function ZipSink(fn, buffers, sinks, sink) {
      _classCallCheck(this, ZipSink);

      this.fn = fn;
      this.buffers = buffers;
      this.sinks = sinks;
      this.sink = sink;
    }

    _createClass(ZipSink, [{
      key: 'event',
      value: function event(time, _ref8) {
        var index = _ref8.index;
        var value = _ref8.value;
        // eslint-disable-line complexity
        var buffers = this.buffers;
        var buffer = buffers[index];

        buffer.push(value);

        if (buffer.length() === 1) {
          if (!ready(this.buffers)) {
            return;
          }

          emitZipped(this.fn, time, buffers, this.sink);
        }

        if (ended(this.buffers, this.sinks)) {
          this.sink.end(time, void 0);
        }
      }
    }, {
      key: 'error',
      value: function error(time, err) {
        this.sink.error(time, err);
      }
    }, {
      key: 'end',
      value: function end(time, _ref9) {
        var index = _ref9.index;
        var value = _ref9.value;

        var buffer = this.buffers[index];
        if (buffer.isEmpty()) {
          this.sink.end(time, value);
        }
      }
    }]);

    return ZipSink;
  }();

  function emitZipped(fn, time, buffers, sink) {
    sink.event(time, invoke(fn, (0, _prelude.map)(head, buffers)));
  }

  function head(buffer) {
    return buffer.shift();
  }

  function ended(buffers, sinks) {
    var length = buffers.length;
    for (var i = 0; i < length; ++i) {
      if (buffers[i].isEmpty() && !sinks[i].active) {
        return true;
      }
    }
    return false;
  }

  function ready(buffers) {
    var length = buffers.length;
    for (var i = 0; i < length; ++i) {
      if (buffers[i].isEmpty()) {
        return false;
      }
    }
    return true;
  }

  exports.disposable = disposable;
  exports.Stream = Stream;
  exports.of = of;
  exports.just = just;
  exports.empty = empty;
  exports.never = never;
  exports.create = create$1;
  exports.from = from;
  exports.fromArray = fromArray;
  exports.fromEvent = fromEvent;
  exports.fromIterable = fromIterable;
  exports.generate = generate;
  exports.iterate = iterate;
  exports.periodic = periodic;
  exports.throwError = throwError;
  exports.unfold = unfold;
  exports.filter = filter;
  exports.map = map$1;
  exports.scan = scan;
  exports.reduce = reduce$1;
  exports.ap = ap;
  exports.concat = concat;
  exports.startWith = startWith;
  exports.combineArray = combineArray;
  exports.combine = combine;
  exports.concatMap = concatMap;
  exports.continueWith = continueWith;
  exports.delay = delay;
  exports.recoverWith = recoverWith;
  exports.flatMapError = flatMapError;
  exports.flatMap = flatMap;
  exports.chain = chain;
  exports.join = join;
  exports.throttle = throttle;
  exports.debounce = debounce;
  exports.loop = loop;
  exports.mergeArray = mergeArray;
  exports.merge = merge;
  exports.mergeMapConcurrently = mergeMapConcurrently;
  exports.mergeConcurrently = mergeConcurrently;
  exports.observe = observe;
  exports.drain = drain;
  exports.awaitPromises = awaitPromises;
  exports.fromPromise = fromPromise;
  exports.sample = sample;
  exports.sampleArray = sampleArray;
  exports.skipRepeats = skipRepeats;
  exports.skipRepeatsWith = skipRepeatsWith;
  exports.slice = slice;
  exports.skip = skip;
  exports.take = take;
  exports.takeWhile = takeWhile;
  exports.skipWhile = skipWhile;
  exports.switchLatest = switchLatest;
  exports.takeUntil = takeUntil;
  exports.skipUntil = skipUntil;
  exports.during = during;
  exports.transduce = transduce;
  exports.tap = tap;
  exports.constant = constant;
  exports.zipArray = zipArray;
  exports.zip = zip;
  exports.withDefaultScheduler = withDefaultScheduler;
  exports.withScheduler = withScheduler;
  exports.runSource = runSource;
  exports.DeferredSink = DeferredSink;
  exports.IndexSink = IndexSink;
  exports.hasValue = hasValue;
  exports.Observer = Observer;
  exports.PropagateTask = PropagateTask;
  exports.ScheduledTask = ScheduledTask;
  exports.Task = Task;
  exports.runAsTask = runAsTask;
  exports.defaultScheduler = defaultScheduler;
  exports.Scheduler = Scheduler;
  exports.timeoutTimer = timeoutTimer;
  exports.nodeTimer = nodeTimer;
  exports.fatalError = fatalError;
  exports.defer = defer;
  exports.isPromise = isPromise;
  exports.Queue = Queue;
  exports.LinkedList = LinkedList;
  exports.binarySearch = binarySearch;
  exports.insertByTime = insertByTime;
  exports.invoke = invoke;
  exports.isIterable = isIterable;
  exports.getIterator = getIterator;
  exports.makeIterable = makeIterable;
  exports.tryRunTask = tryRunTask;
  exports.tryEvent = tryEvent;
  exports.tryEnd = tryEnd;
});
