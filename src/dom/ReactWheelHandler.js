import emptyFunction from '../utils/emptyFunction';
import normalizeWheel from './normalizeWheel';
import requestAnimationFramePolyfill from '../utils/requestAnimationFramePolyfill';

class ReactWheelHandler {

  constructor(onWheel, handleScrollX, handleScrollY, stopPropagation) {
    this._animationFrameID = null;
    this._deltaX = 0;
    this._deltaY = 0;
    this._didWheel = this._didWheel.bind(this);
    if (typeof handleScrollX !== 'function') {
      handleScrollX = handleScrollX ?
        emptyFunction.thatReturnsTrue :
        emptyFunction.thatReturnsFalse;
    }

    if (typeof handleScrollY !== 'function') {
      handleScrollY = handleScrollY ?
        emptyFunction.thatReturnsTrue :
        emptyFunction.thatReturnsFalse;
    }

    if (typeof stopPropagation !== 'function') {
      stopPropagation = stopPropagation ?
        emptyFunction.thatReturnsTrue :
        emptyFunction.thatReturnsFalse;
    }

    this._handleScrollX = handleScrollX;
    this._handleScrollY = handleScrollY;
    this._stopPropagation = stopPropagation;
    this._onWheelCallback = onWheel;
    this.onWheel = this.onWheel.bind(this);
  }

  onWheel(/*object*/ event) {
    var normalizedEvent = normalizeWheel(event);
    var deltaX = this._deltaX + normalizedEvent.pixelX;
    var deltaY = this._deltaY + normalizedEvent.pixelY;
    var handleScrollX = this._handleScrollX(deltaX, deltaY);
    var handleScrollY = this._handleScrollY(deltaY, deltaX);
    if (!handleScrollX && !handleScrollY) {
      return;
    }

    this._deltaX += handleScrollX ? normalizedEvent.pixelX : 0;
    this._deltaY += handleScrollY ? normalizedEvent.pixelY : 0;
    event.preventDefault();

    var changed;
    if (this._deltaX !== 0 || this._deltaY !== 0) {
      if (this._stopPropagation()) {
        event.stopPropagation();
      }
      changed = true;
    }

    if (changed === true && this._animationFrameID === null) {
      this._animationFrameID = requestAnimationFramePolyfill(this._didWheel);
    }
  }

  _didWheel() {
    this._animationFrameID = null;
    this._onWheelCallback(this._deltaX, this._deltaY);
    this._deltaX = 0;
    this._deltaY = 0;
  }
}

module.exports = ReactWheelHandler;
