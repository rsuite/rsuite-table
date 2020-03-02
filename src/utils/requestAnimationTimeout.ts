import requestAnimationFramePolyfill from 'dom-lib/lib/animation/requestAnimationFramePolyfill';
import cancelAnimationFramePolyfill from 'dom-lib/lib/animation/cancelAnimationFramePolyfill';

export const cancelAnimationTimeout = (frame: KeyframeAnimationOptions) =>
  cancelAnimationFramePolyfill(frame.id);

/**
 * Recursively calls requestAnimationFrame until a specified delay has been met or exceeded.
 * When the delay time has been reached the function you're timing out will be called.
 *
 * Credit: Joe Lambert (https://gist.github.com/joelambert/1002116#file-requesttimeout-js)
 */
export const requestAnimationTimeout = (
  callback: Function,
  delay: number
): KeyframeAnimationOptions => {
  let start;
  // wait for end of processing current event handler, because event handler may be long
  Promise.resolve().then(() => {
    start = Date.now();
  });

  let frame = null;

  const timeout = () => {
    if (Date.now() - start >= delay) {
      callback.call(null);
    } else {
      frame.id = requestAnimationFramePolyfill(timeout);
    }
  };

  frame = {
    id: requestAnimationFramePolyfill(timeout)
  };

  return frame;
};
