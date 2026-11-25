/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { gzipSync, gunzipSync } = require('node:zlib');
const { test } = require('node:test');
const checkChromeTraceArtifacts = require('./checkChromeTraceArtifacts');

async function fixture(t) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'table-trace-artifact-'));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const raw = gzipSync(
    JSON.stringify({
      traceEvents: [
        {
          name: 'TimeStamp',
          ts: 1,
          pid: 10,
          tid: 20,
          args: { data: { message: 'rsuite-table:startup-frame-request' } }
        },
        {
          name: 'TimeStamp',
          ts: 3,
          pid: 10,
          tid: 20,
          args: { data: { message: 'rsuite-table:startup-frame-received' } }
        },
        { name: 'FireAnimationFrame', ts: 2, pid: 10, tid: 20 },
        { name: 'Profile', id: '0x1', pid: 10, tid: 20 },
        {
          name: 'ProfileChunk',
          id: '0x1',
          pid: 10,
          tid: 21,
          args: { data: { cpuProfile: { samples: [1, 1] }, timeDeltas: [1, 2] } }
        }
      ]
    })
  );
  for (let index = 0; index < 5; index++) {
    const root = path.join(directory, String(index));
    await fs.mkdir(root);
    await fs.writeFile(
      path.join(root, 'metadata.json'),
      JSON.stringify({
        errors: [],
        dataLossOccurred: false,
        bytes: raw.length
      })
    );
    await fs.writeFile(path.join(root, 'trace.json.gz'), raw);
  }
  return directory;
}

async function changeTrace(directory, mutate) {
  const root = path.join(directory, '4');
  const file = path.join(root, 'trace.json.gz');
  const trace = JSON.parse(gunzipSync(await fs.readFile(file)));
  mutate(trace);
  const raw = gzipSync(JSON.stringify(trace));
  await fs.writeFile(file, raw);
  const metadataFile = path.join(root, 'metadata.json');
  const metadata = JSON.parse(await fs.readFile(metadataFile));
  await fs.writeFile(metadataFile, JSON.stringify({ ...metadata, bytes: raw.length }));
}

test('accepts four complete controls and the complete component trace', async t => {
  const results = await checkChromeTraceArtifacts(await fixture(t));
  assert.equal(results.length, 5);
  assert.ok(results.every(result => result.nativeFrames === 1 && result.profileChunks === 1));
  assert.ok(results.every(result => result.rendererSamples === 2));
});

test('rejects the observed full-run flush error even when component tests passed', async t => {
  const directory = await fixture(t);
  const root = path.join(directory, '4');
  await fs.writeFile(
    path.join(root, 'metadata.json'),
    JSON.stringify({
      errors: ['Error: Trace flush timed out'],
      stopReason: 'launcher kill'
    })
  );
  await fs.rm(path.join(root, 'trace.json.gz'));
  await assert.rejects(checkChromeTraceArtifacts(directory), /diagnostic errors/);
});

test('rejects an absent full component session', async t => {
  const directory = await fixture(t);
  await fs.rm(path.join(directory, '4'), { recursive: true });
  await assert.rejects(checkChromeTraceArtifacts(directory), /full component trace/);
});

test('rejects a missing trace file with otherwise successful metadata', async t => {
  const directory = await fixture(t);
  await fs.rm(path.join(directory, '4/trace.json.gz'));
  await assert.rejects(checkChromeTraceArtifacts(directory), { code: 'ENOENT' });
});

test('rejects trace data loss, truncation and missing native samples', async t => {
  const directory = await fixture(t);
  const metadataFile = path.join(directory, '4/metadata.json');
  const metadata = JSON.parse(await fs.readFile(metadataFile));
  await fs.writeFile(metadataFile, JSON.stringify({ ...metadata, dataLossOccurred: true }));
  await assert.rejects(checkChromeTraceArtifacts(directory), /trace data loss/);
  await fs.writeFile(metadataFile, JSON.stringify({ ...metadata, bytes: metadata.bytes + 1 }));
  await assert.rejects(checkChromeTraceArtifacts(directory), /incomplete trace file/);
  const raw = gzipSync(JSON.stringify({ traceEvents: [] }));
  await fs.writeFile(path.join(directory, '4/trace.json.gz'), raw);
  await fs.writeFile(metadataFile, JSON.stringify({ ...metadata, bytes: raw.length }));
  await assert.rejects(checkChromeTraceArtifacts(directory), /startup frame markers/);
});

test('rejects empty CPU chunks even when a native frame was captured', async t => {
  const directory = await fixture(t);
  await changeTrace(directory, trace => {
    const data = trace.traceEvents.find(event => event.name === 'ProfileChunk').args.data;
    data.cpuProfile.samples = [];
    data.timeDeltas = [];
  });
  await assert.rejects(checkChromeTraceArtifacts(directory), /renderer CPU samples missing/);
});

test('rejects CPU samples from a different renderer process', async t => {
  const directory = await fixture(t);
  await changeTrace(directory, trace => {
    trace.traceEvents.find(event => event.name === 'ProfileChunk').pid = 99;
  });
  await assert.rejects(checkChromeTraceArtifacts(directory), /renderer CPU samples missing/);
});

test('rejects frames outside the native startup request interval', async t => {
  const directory = await fixture(t);
  await changeTrace(directory, trace => {
    trace.traceEvents.find(event => event.name === 'FireAnimationFrame').ts = 4;
  });
  await assert.rejects(checkChromeTraceArtifacts(directory), /startup native frame missing/);
});

test('rejects chunks without their renderer profile identity', async t => {
  const directory = await fixture(t);
  await changeTrace(directory, trace => {
    trace.traceEvents = trace.traceEvents.filter(event => event.name !== 'Profile');
  });
  await assert.rejects(checkChromeTraceArtifacts(directory), /renderer CPU profile missing/);
});
