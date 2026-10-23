let pendingFrame: number | null = null;
let requestedAt = 0;

function frameEnvironment() {
  const frame = window.frameElement;
  const host = frame?.ownerDocument.defaultView;
  const style = frame && host?.getComputedStyle(frame);

  return {
    elapsedMs: performance.now() - requestedAt,
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
    pendingFrame = requestAnimationFrame(() => {
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
    console.error('Browser startup frame unavailable', JSON.stringify(frameEnvironment()));
    cancelAnimationFrame(pendingFrame);
    pendingFrame = null;
  }
});
