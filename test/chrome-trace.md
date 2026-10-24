# Chrome native frame diagnostics

Set `CHROME_TRACE=1 BROWSER=ChromeCi` when running `npm test` with Node.js 22 or
newer. The Chrome CI job enables this collector and uploads
`coverage/chrome-trace/` even if a test fails. Other browser runs keep their
existing launchers. The collector adds no package dependencies.

Each Chrome launcher attempt uses its own fresh profile and loopback debugging
port. Chrome reads a startup trace configuration as it launches. The collector
later adopts that recording through the browser's debugging endpoint. Navigation
and tests do not wait for the debugger. Startup frame request and delivery
timestamps appear in the trace; the controls also attach the debugger after the
native tests have finished to verify that these earlier events survive.
Missing markers mean the trace cannot establish that interval, even if the test
passes.

Chrome 155's first `Tracing.start` adopts a devtools-owned startup session and
then returns its already-started response. The collector accepts that exact
response only for its own prepared process, records the adoption in metadata,
and requires the earlier markers in native controls. Other protocol errors
remain collector failures. The implementation was checked against
[that Chrome revision's tracing handler](https://github.com/chromium/chromium/blob/804d6b05f089b27af8342622a36558c49401a1d4/content/browser/devtools/protocol/tracing_handler.cc)
and [startup configuration](https://github.com/chromium/chromium/blob/804d6b05f089b27af8342622a36558c49401a1d4/services/tracing/public/cpp/trace_startup_config.cc).

The trace includes browser, renderer, compositor, GPU, frame and JavaScript task
events, including V8 samples. The collector limits the recording to 120 seconds
and a 32 MiB ring buffer that retains its most recent events, so slow browser
startup cannot fill the buffer before a failing frame hook runs. Metadata reports data loss,
buffer usage when reported, actual browser and Node versions, and collector errors. Traces are
saved as `trace.json.gz`. A partial
file or a data-loss flag must not be presented as a complete recording. Export
is limited to 128 MiB of compressed data and cleanup closes the connection after 10 seconds.
Earlier events may have left the ring buffer; inspect timestamps and required
markers before attributing a specific interval.

Karma flushes the trace before terminating its owned Chrome process. Collector
failures are recorded separately and do not replace the test result. An
unexpected Chrome process exit may leave only metadata or a partial trace.

Run `npm run test:chrome-trace` to check endpoint cancellation, connection failure,
actual native frame events, an owned 350 ms blocking renderer task, late debugger
attachment, and trace
preservation after a deliberate failing assertion. The control runner expects
that assertion's failed Karma exit; its own command fails if the exit is lost.
On Linux, run these controls under Xvfb as in the workflow.

Tracing affects scheduling. A passing instrumented run qualifies the collector
and the tested revision; it does not explain or repair an earlier untraced
failure. The existing startup hook keeps Mocha's 2000 ms timeout and still waits
for an actual visible native frame. No forced frame, focus change, screenshot,
emulated animation frame or deadline relaxation is used.

Protocol references: [Tracing](https://chromedevtools.github.io/devtools-protocol/tot/Tracing/)
and [IO](https://chromedevtools.github.io/devtools-protocol/tot/IO/).
