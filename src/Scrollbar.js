// @flow
import * as React from 'react';
import classNames from 'classnames';
import _ from 'lodash';
import { DOMMouseMoveTracker, addStyle, getOffset } from 'dom-lib';
import { SCROLLBAR_MIN_WIDTH } from './constants';
import { defaultClassPrefix, getUnhandledProps, prefix, translateDOMPositionXY } from './utils';

type Props = {
  vertical?: boolean,
  length: number,
  scrollLength: number,
  className?: string,
  classPrefix?: string,
  onScroll?: Function,
  onMouseDown?: Function,
  updatePosition: (style: Object, x: number, y: number) => void
};

type Offset = {
  top: number,
  left: number,
  height?: number,
  width?: number
};

type State = {
  barOffset: Offset,
  handlePressed: boolean
};

class Scrollbar extends React.PureComponent<Props, State> {
  static defaultProps = {
    classPrefix: defaultClassPrefix('table-scrollbar'),
    updatePosition: translateDOMPositionXY,
    scrollLength: 1,
    length: 1
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      barOffset: {
        top: 0,
        left: 0
      },
      handlePressed: false
    };
  }

  componentDidMount() {
    this.initBarOffset();
  }

  componentWillUnmount() {
    this.releaseMouseMoves();
  }

  onWheelScroll(delta: number) {
    const { length, scrollLength } = this.props;
    const nextDelta = delta / (scrollLength / length);

    this.updateScrollBarPosition(nextDelta);
  }

  getMouseMoveTracker() {
    return (
      this.mouseMoveTracker ||
      new DOMMouseMoveTracker(this.handleDragMove, this.handleDragEnd, document.body)
    );
  }

  initBarOffset() {
    setTimeout(() => {
      this.bar &&
        this.setState({
          barOffset: getOffset(this.bar)
        });
    }, 1);
  }

  handleMouseDown = (event: SyntheticMouseEvent<*>) => {
    const { onMouseDown } = this.props;

    this.mouseMoveTracker = this.getMouseMoveTracker();
    this.mouseMoveTracker.captureMouseMoves(event);
    this.setState({
      handlePressed: true
    });
    onMouseDown && onMouseDown(event);
  };

  handleDragEnd = () => {
    this.releaseMouseMoves();
    this.setState({
      handlePressed: false
    });
  };

  handleScroll(delta: number, event: SyntheticEvent<*>) {
    const { length, scrollLength, onScroll } = this.props;
    const scrollDelta = delta * (scrollLength / length);

    this.updateScrollBarPosition(delta);
    onScroll && onScroll(scrollDelta, event);
  }

  resetScrollBarPosition(forceDelta: number = 0) {
    this.scrollOffset = 0;
    this.updateScrollBarPosition(0, forceDelta);
  }

  updateScrollBarPosition(delta: number, forceDelta?: number) {
    const { vertical, length, scrollLength, updatePosition } = this.props;
    const max =
      scrollLength && length
        ? length - Math.max((length / scrollLength) * length, SCROLLBAR_MIN_WIDTH + 2)
        : 0;
    const styles = {};

    if (_.isUndefined(forceDelta)) {
      this.scrollOffset += delta;
      this.scrollOffset = Math.max(this.scrollOffset, 0);
      this.scrollOffset = Math.min(this.scrollOffset, max);
    } else {
      this.scrollOffset = forceDelta || 0;
    }

    if (vertical) {
      updatePosition(styles, 0, this.scrollOffset);
    } else {
      updatePosition(styles, this.scrollOffset, 0);
    }

    addStyle(this.handle, styles);
  }

  releaseMouseMoves() {
    if (this.mouseMoveTracker) {
      this.mouseMoveTracker.releaseMouseMoves();
      this.mouseMoveTracker = null;
    }
  }

  handleDragMove = (deltaX: number, deltaY: number, event: SyntheticEvent<*>) => {
    const { vertical } = this.props;

    if (!this.mouseMoveTracker || !this.mouseMoveTracker.isDragging()) {
      return;
    }

    if (_.get(event, 'buttons') === 0 || _.get(window, 'event.buttons') === 0) {
      this.releaseMouseMoves();
      return;
    }

    this.handleScroll(vertical ? deltaY : deltaX, event);
  };

  /**
   * 点击滚动条，然后滚动到指定位置
   */
  handleClick = (event: SyntheticMouseEvent<*>) => {
    if (this.handle && this.handle.contains(event.target)) {
      return;
    }

    const { vertical, length, scrollLength } = this.props;
    const { barOffset } = this.state;
    const offset = vertical ? event.pageY - barOffset.top : event.pageX - barOffset.left;

    const handleWidth = (length / scrollLength) * length;
    const delta = offset - handleWidth;

    const nextDelta =
      offset > this.scrollOffset ? delta - this.scrollOffset : offset - this.scrollOffset;
    this.handleScroll(nextDelta, event);
  };

  scrollOffset: number = 0;
  mouseMoveTracker: any;
  handle: any;
  bar: any;

  bindBarRef = (ref: React.ElementRef<*>) => {
    this.bar = ref;
  };

  bindHandleRef = (ref: React.ElementRef<*>) => {
    this.handle = ref;
  };

  render() {
    const { vertical, length, scrollLength, classPrefix, className, ...rest } = this.props;
    const { handlePressed } = this.state;
    const addPrefix = prefix(classPrefix);
    const classes = classNames(classPrefix, className, {
      [addPrefix('vertical')]: vertical,
      [addPrefix('horizontal')]: !vertical,
      [addPrefix('hide')]: scrollLength <= length,
      [addPrefix('pressed')]: handlePressed
    });

    let styles = {
      [vertical ? 'height' : 'width']: `${(length / scrollLength) * 100}%`,
      [vertical ? 'minHeight' : 'minWidth']: SCROLLBAR_MIN_WIDTH
    };
    const unhandled = getUnhandledProps(Scrollbar, rest);

    return (
      <div
        {...unhandled}
        ref={this.bindBarRef}
        className={classes}
        onClick={this.handleClick}
        role="toolbar"
      >
        <div
          ref={this.bindHandleRef}
          className={addPrefix('handle')}
          style={styles}
          onMouseDown={this.handleMouseDown}
          role="button"
          tabIndex={-1}
        />
      </div>
    );
  }
}

export default Scrollbar;
