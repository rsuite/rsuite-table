/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const { ChromeTraceSession } = require('./chromeTraceSession');

test('cancels endpoint discovery and shares cleanup without changing a test result', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'table-trace-cancel-'));
  try {
    const directory = path.join(root, 'trace');
    const session = new ChromeTraceSession(directory, root, { warn() {} });
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
    const session = new ChromeTraceSession(directory, root, {
      warn: (_, message) => warnings.push(message)
    });
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
