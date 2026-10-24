/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { gunzipSync } = require('node:zlib');
const { transformFileSync } = require('@babel/core');
const { Server, config } = require('karma');
const tracedChrome = require('./chromeTraceLauncher');
const { ChromeTraceSession } = require('./chromeTraceSession');

async function main() {
  const basePath = path.resolve(__dirname, '..');
  await fs.mkdir(path.join(basePath, 'coverage'), { recursive: true });
  const directory = await fs.mkdtemp(path.join(basePath, 'coverage/chrome-trace-controls-'));
  const readyFile = path.join(directory, 'browserReady.js');
  const { code } = transformFileSync(path.join(__dirname, 'browserReady.ts'), {
    configFile: false,
    babelrc: false,
    presets: ['@babel/preset-typescript']
  });
  await fs.writeFile(readyFile, code);
  const cases = [
    { name: 'native frame', expectedExit: 0, body: "it('renders', () => {});" },
    {
      name: 'known busy JavaScript task',
      expectedExit: 0,
      body: `it('delivers a native frame after a known busy task', done => {
        const start = performance.now();
        console.timeStamp('rsuite-table:control-busy-start');
        requestAnimationFrame(() => {
          if (performance.now() - start < 350) return done(new Error('Missing owned busy interval'));
          done();
        });
        while (performance.now() - start < 350) {}
        console.timeStamp('rsuite-table:control-busy-end');
      });`
    },
    {
      name: 'intentional failing assertion',
      expectedExit: 1,
      body: "it('retains a deliberate failure', () => { throw new Error('owned trace control failure'); });"
    },
    {
      name: 'debugger attaches after native tests complete',
      expectedExit: 0,
      lateAttach: true,
      body: "it('completes before debugger attachment', () => {});"
    }
  ];
  const results = [];
  for (const control of cases) {
    const traceRoot = path.join(basePath, 'coverage/chrome-trace');
    const before = new Set(await fs.readdir(traceRoot).catch(() => []));
    const file = path.join(directory, 'control.js');
    await fs.writeFile(file, control.body);
    let nativeComplete;
    const afterNativeTests = new Promise(resolve => {
      nativeComplete = resolve;
    });
    class LateTraceSession extends ChromeTraceSession {
      start() {
        this.starting = afterNativeTests
          .then(() => this.connect())
          .catch(error => this.recordError(error));
      }
      stop(reason) {
        return this.starting.then(() => super.stop(reason));
      }
    }
    const plugin = control.lateAttach
      ? { 'launcher:TracedChrome': ['type', tracedChrome.createTracedChrome(LateTraceSession)] }
      : tracedChrome;
    const processedConfig = await config.parseConfig(
      undefined,
      {
        basePath,
        files: [readyFile, file],
        frameworks: ['mocha', 'trace-control-completion'],
        reporters: ['progress'],
        client: { chromeTrace: true },
        browsers: ['ChromeTraceControl'],
        customLaunchers: { ChromeTraceControl: { base: 'TracedChrome' } },
        plugins: [
          'karma-mocha',
          'karma-chrome-launcher',
          plugin,
          {
            'framework:trace-control-completion': [
              'factory',
              function (emitter) {
                emitter.on('browser_complete', () => nativeComplete());
              }
            ]
          }
        ],
        singleRun: true,
        retryLimit: 0,
        colors: false
      },
      { promiseConfig: true, throwErrors: true }
    );
    const exit = await new Promise(resolve => {
      const server = new Server(processedConfig, resolve);
      server.start();
    });
    assert.equal(exit, control.expectedExit, control.name);
    const added = (await fs.readdir(traceRoot)).filter(name => !before.has(name));
    assert.equal(added.length, 1);
    const traceDir = path.join(traceRoot, added[0]);
    const metadata = JSON.parse(await fs.readFile(path.join(traceDir, 'metadata.json'), 'utf8'));
    assert.deepEqual(metadata.errors, [], control.name);
    assert.equal(metadata.dataLossOccurred, false, control.name);
    assert.ok(metadata.traceReadyAt, control.name);
    assert.equal(metadata.adoptedStartupSession, true, control.name);
    const trace = JSON.parse(gunzipSync(await fs.readFile(path.join(traceDir, 'trace.json.gz'))));
    const markers = trace.traceEvents.filter(event => event.name === 'TimeStamp');
    const messages = markers.map(event => event.args?.data?.message);
    assert.ok(messages.includes('rsuite-table:startup-frame-request'), control.name);
    assert.ok(messages.includes('rsuite-table:startup-frame-received'), control.name);
    const frames = trace.traceEvents.filter(event => event.name === 'FireAnimationFrame');
    assert.ok(frames.length > 0, control.name);
    let knownBusyTask;
    if (control.name === 'known busy JavaScript task') {
      const first = markers.find(
        event => event.args?.data?.message === 'rsuite-table:control-busy-start'
      );
      const last = markers.find(
        event => event.args?.data?.message === 'rsuite-table:control-busy-end'
      );
      assert.ok(first && last && last.ts - first.ts >= 349000);
      knownBusyTask = trace.traceEvents.find(
        event =>
          event.pid === first.pid &&
          event.tid === first.tid &&
          event.ph === 'X' &&
          event.dur >= 349000 &&
          event.ts <= first.ts &&
          event.ts + event.dur >= last.ts
      );
      assert.ok(knownBusyTask, 'Trace must contain the known blocking renderer task');
    }
    results.push({
      name: control.name,
      expectedExit: control.expectedExit,
      actualExit: exit,
      traceDir: path.relative(basePath, traceDir),
      browser: metadata.browser,
      bytes: metadata.bytes,
      nativeFrames: frames.length,
      knownBusyTask,
      errors: metadata.errors
    });
  }
  await fs.writeFile(path.join(directory, 'results.json'), JSON.stringify(results, null, 2) + '\n');
  console.log('Chrome trace native controls passed:', directory);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
