// @flow
import * as React from 'react';
import classNames from 'classnames';
import _ from 'lodash';

import { DOMMouseMoveTracker, addStyle, getOffset, translateDOMPositionXY } from 'dom-lib';

import { SCROLLBAR_MIN_WIDTH } from './constants';
import { defaultClassPrefix, getUnhandledProps, prefix } from './utils';

type Props = {
  vertical?: boolean,
  length: number,
  scrollLength: number,
  className?: string,
  classPrefix?: string,
  onScroll?: Function,
  onMouseDown?: Function
};

type Offset = {
  top: number,
  left: number,
  height?: number,
  width?: number
};

type State = {
  barOffset: Offset,
  handleDown: boolean
};

class Scrollbar extends React.Component<Props, State> {
  static defaultProps = {
    classPrefix: defaultClassPrefix('table-scrollbar'),
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
      handleDown: false
    };
  }

  componentDidMount() {
    this.updateBar();
  }
  shouldComponentUpdate(nextProps: Props, nextState: State) {
    return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);
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
      new DOMMouseMoveTracker(this.hanldeDragMove, this.hanldeDragEnd, document.body)
    );
  }

  updateBar() {
    setTimeout(() => {
      this.bar &&
        this.setState({
          barOffset: getOffset(this.bar)
        });
    }, 1);
  }

  hanldeMouseDown = (event: SyntheticMouseEvent<*>) => {
    const { onMouseDown } = this.props;
    this.mouseMoveTracker = this.getMouseMoveTracker();
    this.mouseMoveTracker.captureMouseMoves(event);
    this.setState({
      handleDown: true
    });
    onMouseDown && onMouseDown(event);
  };

  hanldeDragEnd = () => {
    this.releaseMouseMoves();
    this.setState({
      handleDown: false
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
    const { vertical, length, scrollLength } = this.props;
    const max = scrollLength && length ? length - length / scrollLength * length : 0;
    const styles = {};

    if (_.isUndefined(forceDelta)) {
      this.scrollOffset += delta;
      this.scrollOffset = Math.max(this.scrollOffset, 0);
      this.scrollOffset = Math.min(this.scrollOffset, max);
    } else {
      this.scrollOffset = forceDelta || 0;
    }

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

  hanldeDragMove = (deltaX: number, deltaY: number, event: SyntheticEvent<*>) => {
    const { vertical } = this.props;
    if (!this.mouseMoveTracker || !this.mouseMoveTracker.isDragging()) {
      return;
    }
    this.handleScroll(vertical ? deltaY : deltaX, event);
  };
  hanldeClick = (event: SyntheticMouseEvent<*>) => {
    if (this.handle && this.handle.contains(event.target)) {
      return;
    }

    const { vertical, length, scrollLength } = this.props;
    const { barOffset } = this.state;
    const offset = vertical ? event.pageY - barOffset.top : event.pageX - barOffset.left;

    const handleWidth = length / scrollLength * length;
    const delta = offset - handleWidth;

    const nextDelta =
      offset > this.scrollOffset ? delta - this.scrollOffset : offset - this.scrollOffset;
    this.handleScroll(nextDelta, event);
  };

  scrollOffset: number = 0;
  mouseMoveTracker: any;
  handle: any;
  bar: any;

  render() {
    const { vertical, length, scrollLength, classPrefix, className, ...rest } = this.props;
    const { handleDown } = this.state;
    const addPrefix = prefix(classPrefix);
    const classes = classNames(classPrefix, className, {
      [addPrefix('vertical')]: vertical,
      [addPrefix('horizontal')]: !vertical,
      [addPrefix('hide')]: scrollLength <= length,
      [addPrefix('active')]: !handleDown
    });

    let styles = {
      [vertical ? 'height' : 'width']: `${length / scrollLength * 100}%`,
      [vertical ? 'minHeight' : 'minWidth']: SCROLLBAR_MIN_WIDTH
    };
    const unhandled = getUnhandledProps(Scrollbar, rest);

    return (
      <div
        {...unhandled}
        ref={ref => {
          this.bar = ref;
        }}
        className={classes}
        onClick={this.hanldeClick}
        role="toolbar"
      >
        <div
          ref={ref => {
            this.handle = ref;
          }}
          className={addPrefix('handle')}
          style={styles}
          onMouseDown={this.hanldeMouseDown}
          role="button"
          tabIndex={-1}
        />
      </div>
    );
  }
}

export default Scrollbar;
