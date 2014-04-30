var nextId = 0;

/**
 * This data structure avoids needlessly rerunning dependent computations if the
 * value associated with the dependency hasn't actually changed.
 *
 * This is somewhat similar to CachedValue. The difference is that it still
 * allows a caller to call the changed() method. But it won't invalidate a
 * computation unless the value result has changed. The CachedValue object will
 * only call the changed method on the dep if its own internal computation has
 * changed. Why do we need this? Here's an example where the computation would
 * needlessly run twice. It's useful when we have multiple levels of
 * dependencies (see CachedValue).
 *
 *    var value = {
 *      dep: new Deps.Dependency,
 *
 *      get: function () {
 *        this.dep.depend();
 *        return 1;
 *      }
 *    };
 *    
 *    value.dep.changed();
 *
 *    anotherDep = new Deps.Dependency;
 *
 *    Deps.autorun(function (c) {
 *      anotherDep.depend();
 *      var value = value.get();
 *      console.log('value: ', value);
 *    });
 *
 *    // value hasn't actually changed by comp will rerun
 *    // anyway
 *    anotherDep.changed();
 *
 * Given a value function, only invalidate dependent computations if the result
 * of the value function changes. It works by overriding the "changed" method of
 * Deps.Dependency and by adding a new "get" method. The "get" method
 * automatically creates a dependency but also stores the value at the time the
 * dependency is created. The "changed" method loops through the dependents and
 * only calls the invalidate() method if the new value is different from the
 * cached value.
 * 
 */

Deps.CachedDependency = function (func) {
  this._func = func;
  this._id = nextId++
  Deps.Dependency.prototype.constructor.apply(this, arguments);
};

inherit(Deps.CachedDependency, Deps.Dependency);

_.extend(Deps.CachedDependency.prototype, {

  /**
   * Get the current correct value from the value function. Also record a
   * dependency by calling the depend() method, and cache the value at the time
   * of the dependency on the dependent computation. This will allow us to
   * decide whether to invalidate the computation later if someone calls our
   * changed method.
   */
  get: function () {
    var self = this;
    var value = Deps.nonreactive(function () { return self._func(); });
    var comp = Deps.currentComputation;

    if (comp) {
      comp._cachedDepValues = comp._cachedDepValues || {};
      comp._cachedDepValues[this._id] = value;
    }

    this.depend();
    return value;
  },

  /**
   * Overrides the Deps.Dependency.prototype.changed method. Get the newest
   * result from our value function. Then loop through our dependents and
   * invalidate them only if their cached value is different from the new value.
   */
  changed: function () {
    var self = this;
    var comp;
    var oldValue;
    var newValue = Deps.nonreactive(function () { return self._func(); });

    for (var id in self._dependentsById) {
      comp = self._dependentsById[id];
      oldValue = comp._cachedDepValues[this._id];

      if (oldValue !== newValue)
        comp.invalidate();
    }
  }
});
