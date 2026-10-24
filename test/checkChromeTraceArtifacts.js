/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { gunzipSync } = require('node:zlib');

async function checkChromeTraceArtifacts(directory) {
  const folders = (await fs.readdir(directory, { withFileTypes: true }))
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort();
  assert.equal(folders.length, 5, 'Expected four native controls and the full component trace');
  const results = [];
  for (const folder of folders) {
    const root = path.join(directory, folder);
    const metadata = JSON.parse(await fs.readFile(path.join(root, 'metadata.json'), 'utf8'));
    assert.deepEqual(metadata.errors, [], `${folder}: diagnostic errors`);
    assert.equal(metadata.dataLossOccurred, false, `${folder}: trace data loss`);
    const raw = await fs.readFile(path.join(root, 'trace.json.gz'));
    assert.equal(raw.length, metadata.bytes, `${folder}: incomplete trace file`);
    const trace = JSON.parse(gunzipSync(raw));
    const events = trace.traceEvents;
    const markers = events.filter(event => event.name === 'TimeStamp');
    const marker = name => markers.find(event => event.args?.data?.message === name);
    const requested = marker('rsuite-table:startup-frame-request');
    const received = marker('rsuite-table:startup-frame-received');
    assert.ok(
      requested &&
        received &&
        Number.isFinite(requested.ts) &&
        Number.isFinite(received.ts) &&
        Number.isSafeInteger(requested.pid) &&
        Number.isSafeInteger(requested.tid) &&
        requested.ts <= received.ts &&
        requested.pid === received.pid &&
        requested.tid === received.tid,
      `${folder}: startup frame markers`
    );
    const nativeFrames = events.filter(
      event =>
        event.name === 'FireAnimationFrame' &&
        event.pid === requested.pid &&
        event.tid === requested.tid &&
        event.ts >= requested.ts &&
        event.ts <= received.ts
    ).length;
    assert.ok(nativeFrames > 0, `${folder}: startup native frame missing`);
    const profiles = events.filter(
      event =>
        event.name === 'Profile' &&
        event.pid === requested.pid &&
        event.tid === requested.tid &&
        event.id !== undefined
    );
    assert.ok(profiles.length > 0, `${folder}: renderer CPU profile missing`);
    // Chrome emits chunks on a sampler thread. Link them to the Profile event
    // by process and profile ID instead of requiring the sampler thread ID.
    const chunks = events.filter(
      event =>
        event.name === 'ProfileChunk' &&
        profiles.some(profile => profile.pid === event.pid && profile.id === event.id)
    );
    const rendererSamples = chunks.reduce((total, event) => {
      const samples = event.args?.data?.cpuProfile?.samples;
      if (samples === undefined) return total;
      assert.ok(
        Array.isArray(samples) && samples.every(id => Number.isSafeInteger(id) && id >= 0),
        `${folder}: malformed renderer CPU samples`
      );
      const deltas = event.args?.data?.timeDeltas;
      assert.ok(
        Array.isArray(deltas) && deltas.length === samples.length && deltas.every(Number.isFinite),
        `${folder}: malformed renderer CPU sample times`
      );
      return total + samples.length;
    }, 0);
    assert.ok(
      Number.isSafeInteger(rendererSamples) && rendererSamples > 0,
      `${folder}: renderer CPU samples missing`
    );
    results.push({
      folder,
      bytes: raw.length,
      nativeFrames,
      profileChunks: chunks.length,
      rendererSamples
    });
  }
  return results;
}

if (require.main === module) {
  checkChromeTraceArtifacts(process.argv[2] || 'coverage/chrome-trace').then(
    results => console.log('Chrome trace artifacts verified:', JSON.stringify(results)),
    error => {
      console.error(error);
      process.exitCode = 1;
    }
  );
}

module.exports = checkChromeTraceArtifacts;
