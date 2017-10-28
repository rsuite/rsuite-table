import React from 'react';
import PropTypes from 'prop-types';
import omit from 'lodash/omit';
import isEqual from 'lodash/isEqual';
import classNames from 'classnames';
import { DOMMouseMoveTracker, addStyle, getOffset, translateDOMPositionXY } from 'dom-lib';
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
      barOffset: 0,
      handleDown: false
    };
    this.scrollOffset = 0;
  }

  componentDidMount() {
    this.updateBar();
  }
  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(this.props, nextProps) || !isEqual(this.state, nextState);
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

  updateBar() {
    setTimeout(() => {
      this.bar && this.setState({
        barOffset: getOffset(this.bar)
      });
    }, 1);
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
    const max = scrollLength ? length - ((length / scrollLength) * length) : 0;
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
  hanldeClick = (event) => {
    if (this.handle.contains(event.target)) {
      return;
    }

    const { vertical, length, scrollLength } = this.props;
    const { barOffset } = this.state;
    const offset = vertical ? event.pageY - barOffset.top : event.pageX - barOffset.left;

    const handleWidth = (length / scrollLength) * length;
    const delta = offset - handleWidth;

    const nextDelta = offset > this.scrollOffset ? delta - this.scrollOffset :
      offset - this.scrollOffset;
    this.handleScroll(nextDelta, event);
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
    const elementProps = omit(props, Object.keys(propTypes));

    return (
      <div
        {...elementProps}
        ref={(ref) => {
          this.bar = ref;
        }}
        className={classes}
        onClick={this.hanldeClick}
        role="toolbar"
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
