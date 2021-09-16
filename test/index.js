import '@babel/polyfill';

function runAllTests(tests) {
  tests.keys().forEach(tests);
}

runAllTests(require.context('.', true, /Spec.js$/));
