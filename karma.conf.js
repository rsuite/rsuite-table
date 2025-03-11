/* eslint-disable @typescript-eslint/no-require-imports */

module.exports = config => {
  const { env } = process;
  const { M, F } = env;
  let testFile = 'test/index.js';

  if (M) {
    testFile = `test/${M}Spec.js`;
  } else if (F) {
    testFile = F;
  }

  config.set({
    basePath: '',
    files: [testFile],
    frameworks: ['mocha', 'chai-dom', 'sinon-chai', 'webpack'],
    colors: true,
    reporters: ['mocha', 'coverage'],

    logLevel: config.LOG_INFO,
    preprocessors: {
      'test/*.js': ['webpack']
    },
    webpack: require('./webpack.karma.js'),
    webpackMiddleware: {
      noInfo: true
    },
    browsers: env.BROWSER ? env.BROWSER.split(',') : ['Chrome'],
    customLaunchers: {
      ChromeCi: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      },
      FirefoxAutoAllowGUM: {
        base: 'Firefox',
        prefs: {
          'media.navigator.permission.disabled': true
        }
      }
    },
    plugins: [
      'karma-webpack',
      'karma-mocha',
      'karma-mocha-reporter',
      'karma-sinon-chai',
      'karma-chai-dom',
      'karma-coverage',
      'karma-chrome-launcher',
      'karma-firefox-launcher'
    ],
    coverageReporter: {
      dir: 'coverage',
      reporters: [
        { type: 'html' },
        { type: 'lcov', subdir: 'lcov' } // lcov
      ]
    }
  });
};
