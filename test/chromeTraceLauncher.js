/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('node:path');
const Chrome = require('karma-chrome-launcher')['launcher:Chrome'][1];
const { ChromeTraceSession } = require('./chromeTraceSession');

function createTracedChrome(TraceSession = ChromeTraceSession) {
  function TracedChrome(baseBrowserDecorator, args, logger, basePath, emitter) {
    if (
      args.chromeDataDir ||
      (args.flags || []).some(flag => flag.startsWith('--remote-debugging-'))
    ) {
      throw new Error('Chrome tracing requires its fresh launcher profile and owned loopback port');
    }
    Chrome.call(this, baseBrowserDecorator, {
      ...args,
      flags: [
        ...(args.flags || []),
        '--remote-debugging-address=127.0.0.1',
        '--remote-debugging-port=0'
      ]
    });
    const log = logger.create('chrome-trace');
    const start = this._start;
    const getOptions = this._getOptions;
    const emitAsync = this.emitAsync;
    let session;
    const sessions = [];
    let attempt = 0;
    this._start = url => {
      // ProcessLauncher has created this launcher's fresh, isolated profile at this point.
      session = new TraceSession(
        path.resolve(basePath, 'coverage/chrome-trace', `${this.id}-${++attempt}`),
        this._tempDir,
        log
      );
      sessions.push(session);
      try {
        session.prepare();
      } catch (error) {
        session.recordError(error);
      }
      start.call(this, url);
      session.start();
    };
    this._getOptions = url => getOptions.call(this, url).concat(session.startupFlags);
    this.emitAsync = (event, ...values) => {
      // Kill listeners run concurrently in Karma. Flush BEFORE they terminate Chrome,
      // including forceKill/restart, without overriding Karma's original result.
      if (event === 'kill' && session) {
        return session.stop('launcher kill').then(() => emitAsync.call(this, event, ...values));
      }
      return emitAsync.call(this, event, ...values);
    };
    this.on('done', () => void session?.stop('browser process exited'));
    // A process failure can complete Karma before kill emits again. Await diagnostics
    // during global shutdown as well, including sessions from launcher restarts.
    emitter.on('exit', done => {
      Promise.all(sessions.map(item => item.stop('Karma exit'))).then(() => done());
    });
  }

  TracedChrome.prototype = Object.create(Chrome.prototype);
  TracedChrome.prototype.name = 'TracedChrome';
  TracedChrome.$inject = ['baseBrowserDecorator', 'args', 'logger', 'config.basePath', 'emitter'];
  return TracedChrome;
}

module.exports = { 'launcher:TracedChrome': ['type', createTracedChrome()], createTracedChrome };
