let pendingFrame: number | null = null;
let requestedAt = 0;

function traceMarker(label: string) {
  if (
    (window as Window & { __karma__?: { config: { chromeTrace?: boolean } } }).__karma__?.config
      .chromeTrace
  ) {
    console.timeStamp(`rsuite-table:startup-frame-${label}`);
  }
}

function frameEnvironment() {
  const frame = window.frameElement;
  const host = frame?.ownerDocument.defaultView;
  const style = frame && host?.getComputedStyle(frame);

  return {
    elapsedMs: performance.now() - requestedAt,
    timeOrigin: performance.timeOrigin,
    requestedAt,
    visibility: document.visibilityState,
    readyState: document.readyState,
    focusedDocument: document.hasFocus(),
    viewport: { width: innerWidth, height: innerHeight, devicePixelRatio },
    screen: { width: screen.width, height: screen.height },
    frame: frame
      ? {
          rect: frame.getBoundingClientRect().toJSON(),
          display: style?.display,
          visibility: style?.visibility,
          contentVisibility: style?.contentVisibility,
          hostViewport: { width: host?.innerWidth, height: host?.innerHeight },
          hostVisibility: frame.ownerDocument.visibilityState,
          hostFocusedDocument: frame.ownerDocument.hasFocus()
        }
      : null
  };
}

// Keep Mocha's normal hook timeout: a browser that cannot render must fail setup.
before('the native browser produces a visible frame', () => {
  return new Promise<void>((resolve, reject) => {
    requestedAt = performance.now();
    traceMarker('request');
    pendingFrame = requestAnimationFrame(() => {
      traceMarker('received');
      pendingFrame = null;
      if (document.visibilityState !== 'visible') {
        reject(
          new Error(`Browser rendering is unavailable: ${JSON.stringify(frameEnvironment())}`)
        );
        return;
      }
      resolve();
    });
  });
});

after(() => {
  if (pendingFrame !== null) {
    traceMarker('pending-at-cleanup');
    console.error('Browser startup frame unavailable', JSON.stringify(frameEnvironment()));
    cancelAnimationFrame(pendingFrame);
    pendingFrame = null;
  }
});
