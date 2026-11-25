import WheelHandler from 'dom-lib/WheelHandler';

/** Records original wheel calls without changing event input, callbacks or assertion deadlines. */
export default function observeWheel() {
  const trace: Record<string, unknown>[] = [];
  const prototype = WheelHandler.prototype as any;
  const originals = new Map<string, (...args: any[]) => any>();
  const sample = (stage: string, handler?: any, event?: WheelEvent) => ({
    stage,
    time: performance.now(),
    visibility: document.visibilityState,
    focusedDocument: document.hasFocus(),
    deltaX: handler?.deltaX,
    deltaY: handler?.deltaY,
    animationFrameID: handler?.animationFrameID,
    event: event ? { deltaX: event.deltaX, deltaY: event.deltaY, deltaMode: event.deltaMode } : null
  });

  for (const name of ['onWheel', 'didWheel']) {
    const original = prototype[name];
    originals.set(name, original);
    prototype[name] = function (this: any, ...args: any[]) {
      trace.push(sample(name + ':before', this, name === 'onWheel' ? args[0] : undefined));
      try {
        return original.apply(this, args);
      } finally {
        trace.push(sample(name + ':after', this));
      }
    };
  }
  const frame = requestAnimationFrame(() => trace.push(sample('animation-frame')));
  return {
    log(body: HTMLElement | null, scrollCalls: number, position?: unknown) {
      console.info(
        'Table wheel diagnostic',
        JSON.stringify({
          trace,
          final: sample('assertion-failure'),
          scrollCalls,
          position,
          body: body
            ? {
                connected: body.isConnected,
                clientHeight: body.clientHeight,
                scrollHeight: body.scrollHeight,
                clientWidth: body.clientWidth,
                scrollWidth: body.scrollWidth,
                rect: body.getBoundingClientRect().toJSON()
              }
            : null
        })
      );
    },
    restore() {
      cancelAnimationFrame(frame);
      for (const [name, original] of originals) prototype[name] = original;
    }
  };
}
