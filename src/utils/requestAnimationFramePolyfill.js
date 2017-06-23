
import emptyFunction from './emptyFunction';
import nativeRequestAnimationFrame from './nativeRequestAnimationFrame';

let lastTime = 0;

/**
 * Here is the native and polyfill version of requestAnimationFrame.
 * Please don't use it directly and use requestAnimationFrame module instead.
 */
const requestAnimationFrame =
  nativeRequestAnimationFrame || function (callback) {
    var currTime = Date.now();
    var timeDelay = Math.max(0, 16 - (currTime - lastTime));
    lastTime = currTime + timeDelay;
    return global.setTimeout(function () {
      callback(Date.now());
    }, timeDelay);
  };


// Works around a rare bug in Safari 6 where the first request is never invoked.
requestAnimationFrame(emptyFunction);

export default requestAnimationFrame;
