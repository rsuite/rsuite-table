import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { DOMMouseMoveTracker } from 'dom-lib';
import ClassNameMixin from './mixins/ClassNameMixin';
import ReactComponentWithPureRenderMixin from './mixins/ReactComponentWithPureRenderMixin';


function clamp(value, min, max) {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

const ColumnResizeHandler = React.createClass({
  mixins: [
    ClassNameMixin,
    ReactComponentWithPureRenderMixin
  ],
  propTypes: {
    height: PropTypes.number,
    columnWidth: PropTypes.number,
    columnLeft: PropTypes.number,
    columnFixed: PropTypes.bool,
    onColumnResizeStart: PropTypes.func,
    onColumnResizeEnd: PropTypes.func,
    onColumnResizeMove: PropTypes.func,
  },
  _columnWidth: 0,
  _cursorDelta: 0,
  _onMove(deltaX, deltaY) {

    if (!this.isKeyDown) {
      return;
    }

    this._cursorDelta += deltaX;
    this._columnWidth = clamp(this.props.columnWidth + this._cursorDelta, 20);
    this.props.onColumnResizeMove(this._columnWidth, this.props.columnLeft, this.props.columnFixed);
  },

  _onColumnResizeEnd() {

    this.isKeyDown = false;

    this.props.onColumnResizeEnd(
      this._columnWidth,
      this._cursorDelta
    );

    if (this._mouseMoveTracker) {
      this._mouseMoveTracker.releaseMouseMoves();
      this._mouseMoveTracker = null;
    }

  },
  _getMouseMoveTracker() {
    return this._mouseMoveTracker || new DOMMouseMoveTracker(
      this._onMove,
      this._onColumnResizeEnd,
      document.body
    );
  },
  _onColumnResizeMouseDown(event) {

    this._mouseMoveTracker = this._getMouseMoveTracker();
    this.isKeyDown = true;
    this._cursorDelta = 0;

    this.props.onColumnResizeStart({
      clientX: event.clientX,
      clientY: event.clientY,
      preventDefault: function () { }
    });
  },

  componentWillMount() {
    this._columnWidth = this.props.columnWidth;
  },

  componentWillReceiveProps(nextProps) {
    if (this.isKeyDown && nextProps.initialEvent && !this._mouseMoveTracker.isDragging()) {
      this._mouseMoveTracker.captureMouseMoves(nextProps.initialEvent);
    }
    if (nextProps.columnWidth !== this.props.columnWidth) {
      this._columnWidth = nextProps.columnWidth;
    }
  },
  componentWillUnmount() {
    if (this._mouseMoveTracker) {
      this._mouseMoveTracker.releaseMouseMoves();
      this._mouseMoveTracker = null;
    }
  },
  render() {


    let { columnLeft, height } = this.props;

    let styles = {
      width: 6,
      left: this._columnWidth + columnLeft - 2,
      height
    };

    let classes = classNames(this.prefix('column-resize-spanner'));

    return (
      <div
        className={classes}
        style={styles}
        onMouseDown={this._onColumnResizeMouseDown}
        ref="spanner"
      >
      </div>
    );
  }
});

export default ColumnResizeHandler;
