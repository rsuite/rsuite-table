import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import classNames from 'classnames';
import { DOMMouseMoveTracker, addStyle, translateDOMPositionXY } from 'dom-lib';
import decorate from './utils/decorate';
import { SCROLLBAR_MIN_WIDTH } from './constants';

const propTypes = {
  vertical: PropTypes.bool,
  length: PropTypes.number,
  scrollLength: PropTypes.number,
  onScroll: PropTypes.func,
  onMouseDown: PropTypes.func
};

class Scrollbar extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      handleDown: false
    };
    this.scrollOffset = 0;
  }

  componentWillUnmount() {

    this.releaseMouseMoves();
  }

  onWheelScroll(delta) {

    const { length, scrollLength } = this.props;
    const nextDelta = delta / (scrollLength / length);
    this.updateScrollBarPosition(nextDelta);
  }

  getMouseMoveTracker() {
    return this.mouseMoveTracker || new DOMMouseMoveTracker(
      this.hanldeDragMove,
      this.hanldeDragEnd,
      document.body
    );
  }

  hanldeMouseDown = (event) => {
    const { onMouseDown } = this.props;
    this.mouseMoveTracker = this.getMouseMoveTracker();
    this.mouseMoveTracker.captureMouseMoves(event);
    this.setState({
      handleDown: true
    });
    onMouseDown && onMouseDown(event);
  }

  hanldeDragEnd = () => {
    this.releaseMouseMoves();
    this.setState({
      handleDown: false
    });
  }

  handleScroll(delta, event) {
    const { length, scrollLength, onScroll } = this.props;
    const scrollDelta = delta * (scrollLength / length);
    this.updateScrollBarPosition(delta);
    onScroll && onScroll(scrollDelta, event);
  }

  resetScrollBarPosition() {
    this.scrollOffset = 0;
    this.updateScrollBarPosition(0);
  }

  updateScrollBarPosition(delta) {

    const { vertical, length, scrollLength } = this.props;
    const max = length - ((length / scrollLength) * length);
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
  }

  releaseMouseMoves() {

    if (this.mouseMoveTracker) {
      this.mouseMoveTracker.releaseMouseMoves();
      this.mouseMoveTracker = null;
    }
  }

  hanldeDragMove = (deltaX, deltaY, event) => {

    const { vertical } = this.props;
    if (!this.mouseMoveTracker || !this.mouseMoveTracker.isDragging()) {
      return;
    }
    this.handleScroll(vertical ? deltaY : deltaX, event);
  }

  render() {

    const { vertical, length, scrollLength, className, ...props } = this.props;
    const { handleDown } = this.state;
    const classes = classNames(this.prefix('scrollbar-wrapper'), {
      vertical,
      horizontal: !vertical,
      hide: scrollLength <= length,
      active: handleDown
    }, className);

    let styles = {
      [vertical ? 'height' : 'width']: `${(length / scrollLength) * 100}%`,
      [vertical ? 'minHeight' : 'minWidth']: SCROLLBAR_MIN_WIDTH,
    };
    const elementProps = _.omit(props, Object.keys(propTypes));

    return (
      <div
        {...elementProps}
        className={classes}
      >
        <div
          ref={(ref) => {
            this.handle = ref;
          }}
          className="scrollbar-handle"
          style={styles}
          onMouseDown={this.hanldeMouseDown}
          role="button"
          tabIndex={-1}
        />

      </div>
    );
  }

}

Scrollbar.propTypes = propTypes;


export default decorate()(Scrollbar);
