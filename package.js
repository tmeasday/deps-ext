Package.describe({
  name: 'deps-ext',
  summary: 'Extensions to Meteor Deps'
});

Package.on_use(function (api) {
  api.use('underscore');
  api.use('deps');
  api.add_files('utils.js', ['client'])
  api.add_files('cached_value.js', ['client'])
  api.add_files('cached_dependency.js', ['client'])
});

Package.on_test(function (api) {
  api.use('tinytest');
  api.use('test-helpers');
  api.use('deps-ext');
  api.add_files('deps_ext_tests.js', 'client');
});
