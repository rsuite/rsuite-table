/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const { gzipSync } = require('node:zlib');
const { ChromeTraceSession } = require('./chromeTraceSession');

test('cancels endpoint discovery and shares cleanup without changing a test result', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'table-trace-cancel-'));
  try {
    const directory = path.join(root, 'trace');
    const session = new ChromeTraceSession(directory, root, { warn() {} }, 60000);
    session.start();
    const first = session.stop('launcher kill');
    assert.equal(first, session.stop('duplicate kill'));
    await first;
    const metadata = JSON.parse(await fs.readFile(path.join(directory, 'metadata.json'), 'utf8'));
    assert.deepEqual(metadata.errors, []);
    assert.equal(metadata.stopReason, 'launcher kill');
    assert.equal(metadata.bytes, undefined);
    assert.ok(metadata.finishedAt);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('records a failed owned CDP connection and still completes cleanup', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'table-trace-connection-'));
  const server = http.createServer();
  server.on('upgrade', (_, socket) => {
    socket.end('HTTP/1.1 503 Service Unavailable\r\nConnection: close\r\n\r\n');
  });
  try {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    await fs.writeFile(
      path.join(root, 'DevToolsActivePort'),
      `${server.address().port}\n/devtools/browser/owned-control\n`
    );
    const directory = path.join(root, 'trace');
    const warnings = [];
    const session = new ChromeTraceSession(
      directory,
      root,
      { warn: (_, message) => warnings.push(message) },
      60000
    );
    session.start();
    await session.starting;
    await session.stop('launcher kill');
    const metadata = JSON.parse(await fs.readFile(path.join(directory, 'metadata.json'), 'utf8'));
    assert.equal(metadata.errors.length, 1);
    assert.match(metadata.errors[0], /CDP connection failed/);
    assert.equal(warnings.length, 1);
    assert.ok(metadata.finishedAt);
  } finally {
    await new Promise(resolve => server.close(resolve));
    await fs.rm(root, { recursive: true, force: true });
  }
});

for (const { captureTimeout, delay, expectedError } of [
  {
    captureTimeout: 60000,
    delay: 12000,
    expectedError: 'Invalid owned Chrome DevToolsActivePort'
  },
  {
    captureTimeout: 5000,
    delay: 6000,
    expectedError: 'Owned Chrome DevToolsActivePort did not appear'
  }
]) {
  test(`uses the ${captureTimeout} ms browser capture timeout to discover the endpoint`, async t => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'table-trace-capture-'));
    const endpoint = path.join(root, 'DevToolsActivePort');
    const directory = path.join(root, 'trace');
    const readFile = fs.readFile;
    let now = Date.now();
    let published = false;

    t.mock.method(Date, 'now', () => now);
    t.mock.method(fs, 'readFile', async (file, ...options) => {
      if (file !== endpoint) return readFile(file, ...options);

      if (published) return 'malformed endpoint';
      published = true;
      now += delay;
      return readFile(file, ...options);
    });

    try {
      const session = new ChromeTraceSession(directory, root, { warn() {} }, captureTimeout);
      session.start();
      await session.starting;
      await session.stop('launcher kill');
      assert.equal(session.metadata.errors[0], 'Error: ' + expectedError);
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });
}

test('exports a trace that finishes after the end command is acknowledged', async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'table-trace-flush-'));
  try {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const session = new ChromeTraceSession(root, root, { warn() {} }, 60000);
    const raw = gzipSync('{}');
    let complete;
    session.completed = new Promise(resolve => {
      complete = resolve;
    });
    session.tracing = true;
    session.protocol = {
      close() {},
      async send(method) {
        if (method === 'Tracing.end') {
          setTimeout(() => complete({ stream: 'trace', dataLossOccurred: false }), 10000);
        }
        if (method === 'IO.read') {
          return { data: raw.toString('base64'), base64Encoded: true, eof: true };
        }
      }
    };
    const stop = session.stop('launcher kill');
    await new Promise(resolve => setImmediate(resolve));
    t.mock.timers.tick(10000);
    await stop;
    assert.deepEqual(session.metadata.errors, []);
    assert.deepEqual(await fs.readFile(path.join(root, 'trace.json.gz')), raw);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});
