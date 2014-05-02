/**
 * Caches a function's return value such that any computations that rely on
 * that value are only invalidated if the value actually changes. The func is
 * run inside of an internal computation (autorun) and the outer computation (if
 * any) is only invalidated if the internal computation runs and the new value
 * from func is different than the previous value.
 *
 * This class is similar to UI.Box and UI.emboxValue with a few key differences.
 * First, the get() method will *always* return the most current value. This
 * means, a flush cycle is not required to get the latest value. Second, the
 * recompute method allows you to reset the computation, if for example, the
 * reactive function should be run again. This is needed because the computation
 * is set up from the constructor function but in a data structure like
 * ReactiveReadyList, all of the ready handle may not have been added yet.
 *
 */

Deps.CachedValue = function (func) {
  this._dep = new Deps.CachedDependency(func, this);
  this._func = func;
  this._value = null;
  this._compute();
};

Deps.CachedValue.prototype = {
  /**
   * Get the latest value. Always runs the value function so you will have the
   * latest value without waiting for a flush.
   */
  get: function () {
    if (this._comp.stopped)
      this._compute();
    
    return this._dep.get();
  },

  /**
   * stop the internal computation.
   */
  stop: function () {
    if (this._comp)
      this._comp.stop();
  },

  /**
   * stop the internal computation and set up the computation again. useful if
   * you need the autorun function to run again (establishing new dependencies).
   *
   */
  recompute: function () {
    this.stop();
    this._compute();
  },

  _compute: function () {
    var self = this;
    this._comp = Deps.autorun(function () {
      var newValue = self._func();

      if (newValue !== self._value) {
        self._value = newValue;
        self._dep.changed();
      }
    });
  }
};

Deps.cache = function (func, thisArg) {
  return new Deps.CachedValue(_.bind(func, thisArg));
};
