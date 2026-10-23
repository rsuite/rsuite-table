let pendingFrame: number | null = null;

// Keep Mocha's normal hook timeout: a browser that cannot render must fail setup.
before('the native browser produces a visible frame', () => {
  return new Promise<void>((resolve, reject) => {
    pendingFrame = requestAnimationFrame(() => {
      pendingFrame = null;
      if (document.visibilityState !== 'visible') {
        reject(new Error(`Browser rendering is unavailable: ${document.visibilityState}`));
        return;
      }
      resolve();
    });
  });
});

after(() => {
  if (pendingFrame !== null) {
    console.error('Browser startup frame unavailable', {
      visibility: document.visibilityState,
      focusedDocument: document.hasFocus()
    });
    cancelAnimationFrame(pendingFrame);
    pendingFrame = null;
  }
});
