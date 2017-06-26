import React, { PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import classNames from 'classnames';
import ClassNameMixin from './mixins/ClassNameMixin';
import { DOMMouseMoveTracker, addStyle, translateDOMPositionXY } from 'dom-lib';


const BAR_MIN_WIDTH = 20;

const Scrollbar = React.createClass({
  mixins: [
    ClassNameMixin
  ],
  propTypes: {
    vertical: PropTypes.bool,
    length: PropTypes.number,
    scrollLength: PropTypes.number,
    onScroll: PropTypes.func,
  },
  getInitialState() {
    return {
      handleDown: false
    };
  },
  getMouseMoveTracker() {
    return this._mouseMoveTracker || new DOMMouseMoveTracker(
      this.hanldeDragMove,
      this.hanldeDragEnd,
      document.body
    );
  },
  releaseMouseMoves() {
    if (this._mouseMoveTracker) {
      this._mouseMoveTracker.releaseMouseMoves();
      this._mouseMoveTracker = null;
    }
  },
  hanldeMouseDown(event) {

    this._mouseMoveTracker = this.getMouseMoveTracker();
    this._mouseMoveTracker.captureMouseMoves(event);
    this.setState({
      handleDown: true
    });

  },
  hanldeDragEnd() {
    this.releaseMouseMoves();
    this.setState({
      handleDown: false
    });
  },
  handleScroll(delta, event) {
    const { length, scrollLength, vertical, onScroll } = this.props;
    const style = {};
    const scrollDelta = delta * (scrollLength / length);
    this.updateScrollBarPosition(delta);
    onScroll && onScroll(scrollDelta, event);
  },
  resetScrollBarPosition() {
    this.scrollOffset = 0;
    this.updateScrollBarPosition(0);
  },
  updateScrollBarPosition(delta) {
    const { vertical, length, scrollLength } = this.props;
    const max = length - (length / scrollLength * length);
    const styles = {};

    this.scrollOffset += delta;
    this.scrollOffset = Math.max(this.scrollOffset, 0);
    this.scrollOffset = Math.min(this.scrollOffset, max);

    if (vertical) {
      translateDOMPositionXY(styles, 0, this.scrollOffset);
    } else {
      translateDOMPositionXY(styles, this.scrollOffset, 0);
    }
    addStyle(this.handle, styles);
  },
  onWheelScroll(delta) {

    const { length, scrollLength } = this.props;
    const nextDelta = delta / (scrollLength / length);
    this.updateScrollBarPosition(nextDelta);
  },
  hanldeDragMove(deltaX, deltaY, event) {
    const { vertical } = this.props;
    if (!this._mouseMoveTracker || !this._mouseMoveTracker.isDragging()) {
      return;
    }
    this.handleScroll(vertical ? deltaY : deltaX, event);
  },
  componentWillMount() {
    this.scrollOffset = 0;
  },

  componentWillUnmount() {
    this.releaseMouseMoves();
  },
  render() {
    const { vertical, length, scrollLength } = this.props;
    const { handleDown } = this.state;

    const classes = classNames(this.prefix('scrollbar-wrapper'), {
      vertical,
      horizontal: !vertical,
      hide: scrollLength <= length,
      active: handleDown
    });

    let styles = {
      [vertical ? 'height' : 'width']: `${length / scrollLength * 100}%`,
      [vertical ? 'minHeight' : 'minWidth']: BAR_MIN_WIDTH
    };

    return (
      <div className={classes}>
        <div
          ref={ref => this.handle = ref}
          className='scrollbar-handle'
          style={styles}
          onMouseDown={this.hanldeMouseDown}
        />

      </div>
    );
  }
});

export default Scrollbar;
