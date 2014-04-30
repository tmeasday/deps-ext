Tinytest.add('deps-ext - Deps.CachedDependency', function (test) {
  var value = 1;

  var dep = new Deps.CachedDependency(function () {
    return value; 
  });

  var runs = 0;
  var newValue;

  Deps.autorun(function (c) {
    newValue = dep.get();
    runs++;
  });

  test.equal(runs, 1, "comp should have run once");
  test.equal(newValue, 1, "value should be 1");

  dep.changed();
  Deps.flush();
  test.equal(runs, 1, "comp should not rerun because value not changed");

  value = 2;
  dep.changed();
  Deps.flush();
  test.equal(runs, 2, "comp should rerun because value has changed");
  test.equal(newValue, 2, "new value should be 2");
});

Tinytest.add('deps-ext - Deps.CachedValue', function (test) {
  var dep = new Deps.Dependency;
  var v = 1; 
  var runs = 0;
  var newValue;
  var value = Deps.cache(function () {
    dep.depend();
    return v;
  });

  Deps.autorun(function (c) {
    newValue = value.get();
    runs++;
  });

  test.equal(runs, 1, "comp should have run once");
  test.equal(newValue, 1, "value should be 1");

  dep.changed();
  Deps.flush();
  test.equal(runs, 1, "outer comp should not rerun because value hasn't changed");
  test.equal(newValue, 1, "outer comp value should still be 1");

  v = 2;
  dep.changed();
  Deps.flush();
  test.equal(runs, 2, "outer comp should rerun because value is different now");
  test.equal(newValue, 2, "outer comp value should be 2 now");
});
