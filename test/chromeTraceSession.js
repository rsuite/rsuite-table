/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs/promises');
const syncFs = require('node:fs');
const path = require('node:path');

const traceConfig = {
  recordMode: 'recordContinuously',
  traceBufferSizeInKb: 32768,
  enableSampling: true,
  includedCategories: [
    'toplevel',
    'cc',
    'viz',
    'gpu',
    'renderer.scheduler',
    'devtools.timeline',
    'blink.user_timing',
    'v8.execute',
    'disabled-by-default-devtools.timeline.frame',
    'disabled-by-default-v8.cpu_profiler'
  ],
  excludedCategories: ['*']
};

class Protocol {
  constructor(url) {
    this.pending = new Map();
    this.id = 0;
    this.socket = new WebSocket(url);
    this.opened = new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('CDP connection timed out'));
        this.socket.close();
      }, 3000);
      this.socket.addEventListener(
        'open',
        () => {
          clearTimeout(timer);
          resolve();
        },
        { once: true }
      );
      this.socket.addEventListener(
        'error',
        () => {
          clearTimeout(timer);
          reject(new Error('CDP connection failed'));
        },
        { once: true }
      );
      this.socket.addEventListener(
        'close',
        () => {
          clearTimeout(timer);
          reject(new Error('CDP connection closed before opening'));
        },
        { once: true }
      );
    });
    this.socket.addEventListener('message', event => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const request = this.pending.get(message.id);
        if (!request) return;
        this.pending.delete(message.id);
        clearTimeout(request.timer);
        if (message.error) {
          const error = new Error(message.error.message);
          error.code = message.error.code;
          request.reject(error);
        } else request.resolve(message.result);
      } else if (message.method === 'Tracing.bufferUsage') {
        this.onBufferUsage?.(message.params);
      } else if (message.method === 'Tracing.tracingComplete') {
        this.onTracingComplete?.(message.params);
      }
    });
    this.socket.addEventListener('close', () => {
      for (const request of this.pending.values()) {
        clearTimeout(request.timer);
        request.reject(new Error('CDP connection closed'));
      }
      this.pending.clear();
    });
  }

  async send(method, params = {}) {
    await this.opened;
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP command timed out: ${method}`));
      }, 3000);
      this.pending.set(id, { resolve, reject, timer });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.socket.close();
  }
}

class ChromeTraceSession {
  constructor(directory, profile, log) {
    this.directory = directory;
    this.profile = profile;
    this.log = log;
    this.metadata = {
      node: process.version,
      platform: process.platform,
      startedAt: new Date().toISOString(),
      traceConfig,
      instrumentationOnly: true,
      errors: []
    };
    this.cancelled = false;
    this.startupFlags = [];
  }

  prepare() {
    // Chrome reads this before it creates the test page. CDP later adopts this
    // recording; asynchronous debugger discovery must not miss a fast frame hook.
    const startupConfig = {
      startup_duration: 120,
      trace_config: {
        record_mode: 'record-continuously',
        trace_buffer_size_in_kb: traceConfig.traceBufferSizeInKb,
        included_categories: traceConfig.includedCategories,
        excluded_categories: traceConfig.excludedCategories
      }
    };
    syncFs.mkdirSync(this.directory, { recursive: true });
    const configFile = path.join(this.directory, 'startup-config.json');
    syncFs.writeFileSync(configFile, JSON.stringify(startupConfig));
    this.startupFlags = [
      `--trace-config-file=${configFile}`,
      '--trace-startup-format=json',
      '--trace-startup-owner=devtools'
    ];
    this.prepared = true;
    this.metadata.startupConfig = startupConfig;
  }

  start() {
    this.starting = this.connect().catch(error => this.recordError(error));
  }

  recordError(error) {
    this.metadata.errors.push(String(error));
    this.log.warn('Chrome trace: %s', String(error));
  }

  async connect() {
    await fs.mkdir(this.directory, { recursive: true });
    if (typeof WebSocket !== 'function') throw new Error('Chrome tracing requires Node.js 22+');
    const deadline = Date.now() + 10000;
    while (!this.cancelled && Date.now() < deadline) {
      let activePort;
      try {
        activePort = await fs.readFile(path.join(this.profile, 'DevToolsActivePort'), 'utf8');
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
      if (activePort) {
        const [port, endpoint] = activePort.trim().split('\n');
        if (!/^\d+$/.test(port) || !endpoint?.startsWith('/devtools/browser/')) {
          throw new Error('Invalid owned Chrome DevToolsActivePort');
        }
        this.protocol = new Protocol(`ws://127.0.0.1:${port}${endpoint}`);
        this.metadata.browser = await this.protocol.send('Browser.getVersion');
        this.protocol.onBufferUsage = event => {
          this.metadata.lastBufferUsage = event;
        };
        this.completed = new Promise(resolve => {
          this.protocol.onTracingComplete = resolve;
        });
        try {
          await this.protocol.send('Tracing.start', {
            transferMode: 'ReturnAsStream',
            streamFormat: 'json',
            streamCompression: 'gzip',
            traceConfig,
            bufferUsageReportingInterval: 1000
          });
        } catch (error) {
          // Chrome 155 adopts its devtools-owned startup session before returning
          // this exact response. Accept it only for our prepared, isolated process.
          // Native controls require the earlier frame markers in the exported data.
          if (
            !this.prepared ||
            error.code !== -32000 ||
            error.message !== 'Tracing has already been started (possibly in another tab).'
          )
            throw error;
          this.metadata.adoptedStartupSession = true;
        }
        this.metadata.traceReadyAt = new Date().toISOString();
        this.tracing = true;
        // This bounds diagnostics only; it never changes a test or browser deadline.
        const remaining = 120000 - (Date.now() - Date.parse(this.metadata.startedAt));
        this.limit = setTimeout(
          () => this.stop('diagnostic duration limit'),
          Math.max(0, remaining)
        );
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 25));
    }
    if (!this.cancelled) throw new Error('Owned Chrome DevToolsActivePort did not appear');
  }

  stop(reason) {
    if (!this.stopping) {
      this.cancelled = true;
      this.stopping = this.finish(reason);
    }
    return this.stopping;
  }

  async finish(reason) {
    this.metadata.stopReason = reason;
    clearTimeout(this.limit);
    // Ensure a stuck diagnostic connection cannot hold Karma's launcher cleanup.
    const deadline = setTimeout(() => this.protocol?.close(), 10000);
    try {
      await this.starting;
      clearTimeout(this.limit);
      if (this.tracing) {
        await this.protocol.send('Tracing.end');
        const result = await Promise.race([
          this.completed,
          new Promise((_, reject) => {
            this.completeTimer = setTimeout(() => reject(new Error('Trace flush timed out')), 8000);
          })
        ]);
        clearTimeout(this.completeTimer);
        this.metadata.dataLossOccurred = result.dataLossOccurred;
        if (!result.stream) throw new Error('Chrome did not return a trace stream');
        const output = await fs.open(path.join(this.directory, 'trace.json.gz.partial'), 'wx');
        let bytes = 0;
        try {
          let eof = false;
          while (!eof) {
            const chunk = await this.protocol.send('IO.read', {
              handle: result.stream,
              size: 262144
            });
            const data = Buffer.from(chunk.data, chunk.base64Encoded ? 'base64' : 'utf8');
            bytes += data.length;
            if (bytes > 128 * 1024 * 1024) throw new Error('Trace file exceeded 128 MiB limit');
            await output.writeFile(data);
            eof = chunk.eof;
          }
        } finally {
          await output.close();
          await this.protocol.send('IO.close', { handle: result.stream });
        }
        await fs.rename(
          path.join(this.directory, 'trace.json.gz.partial'),
          path.join(this.directory, 'trace.json.gz')
        );
        this.metadata.bytes = bytes;
      }
    } catch (error) {
      this.recordError(error);
    } finally {
      clearTimeout(deadline);
      clearTimeout(this.completeTimer);
      this.protocol?.close();
      this.metadata.finishedAt = new Date().toISOString();
      try {
        await fs.mkdir(this.directory, { recursive: true });
        await fs.writeFile(
          path.join(this.directory, 'metadata.json'),
          JSON.stringify(this.metadata, null, 2) + '\n'
        );
      } catch (error) {
        this.recordError(error);
      }
    }
  }
}

module.exports = { ChromeTraceSession };
