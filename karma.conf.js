/* eslint-disable @typescript-eslint/no-require-imports */

module.exports = config => {
  const { env } = process;
  const { M, F } = env;
  const chromeTrace = env.CHROME_TRACE === '1';

  // Weird pattern syntax but works
  // @see https://github.com/karma-runner/karma/issues/1532#issuecomment-127128326
  let testFile = 'test/*Spec.+(js|ts|tsx)';

  if (M) {
    testFile = `test/${M}Spec.+(js|ts|tsx)`;
  } else if (F) {
    testFile = F;
  }

  config.set({
    basePath: '',
    files: ['test/browserReady.ts', testFile],
    frameworks: ['mocha', 'chai-dom', 'sinon-chai', 'webpack'],
    client: { chromeTrace },
    colors: true,
    reporters: ['mocha', 'coverage', 'source-coverage'],

    logLevel: config.LOG_INFO,
    preprocessors: {
      'test/browserReady.ts': ['webpack'],
      'test/**/*Spec.+(js|ts|tsx)': ['webpack']
    },
    webpack: require('./webpack.karma.js'),
    webpackMiddleware: {
      noInfo: true
    },
    browsers: env.BROWSER ? env.BROWSER.split(',') : ['Chrome'],
    customLaunchers: {
      ChromeCi: {
        base: chromeTrace ? 'TracedChrome' : 'Chrome',
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
      'karma-firefox-launcher',
      ...(chromeTrace ? [require('./test/chromeTraceLauncher')] : []),
      require('./test/sourceCoverageReporter')
    ],
    coverageReporter: {
      dir: 'coverage',
      reporters: [
        { type: 'html' },
        { type: 'json' },
        { type: 'text-summary' },
        { type: 'lcov', subdir: 'lcov' } // lcov
      ]
    }
  });
};
