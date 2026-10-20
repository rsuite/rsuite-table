/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');

function SourceCoverageReporter(logger, basePath) {
  const log = logger.create('source-coverage');
  const sourceDir = path.resolve(basePath, 'src');
  let failed = false;

  this.onRunStart = () => {
    failed = false;
  };

  this.onBrowserComplete = (browser, result) => {
    const coverage = result?.coverage || {};
    const files = Object.entries(coverage);
    let statements = 0;
    let hit = 0;

    for (const [file, data] of files) {
      const relative = path.relative(sourceDir, path.resolve(basePath, file));
      const counts = Object.values(data.s || {});
      if (
        !relative ||
        relative.startsWith(`..${path.sep}`) ||
        path.isAbsolute(relative) ||
        !/\.tsx?$/.test(relative) ||
        counts.some(count => !Number.isSafeInteger(count) || count < 0)
      ) {
        log.error('%s: invalid source coverage for %s', browser.name, file);
        failed = true;
        return;
      }
      statements += counts.length;
      hit += counts.filter(count => count > 0).length;
    }

    if (!files.length || !hit) {
      log.error('%s: no executed source coverage; check Babel instrumentation', browser.name);
      failed = true;
      return;
    }

    log.info(
      '%s: %d source files, %d/%d statements hit',
      browser.name,
      files.length,
      hit,
      statements
    );
  };

  this.onExit = done => done(failed ? 1 : undefined);
}

SourceCoverageReporter.$inject = ['logger', 'config.basePath'];

module.exports = { 'reporter:source-coverage': ['type', SourceCoverageReporter] };
