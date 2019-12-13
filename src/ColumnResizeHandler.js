// @flow

import * as React from 'react';
import classNames from 'classnames';
import _ from 'lodash';
import { DOMMouseMoveTracker } from 'dom-lib';
import { defaultClassPrefix, getUnhandledProps, isRTL } from './utils';

type Client = {
  clientX?: number,
  clientY?: number,
  preventDefault?: Function
};

type Props = {
  height?: number,
  initialEvent?: Object,
  columnWidth?: number,
  columnLeft?: number,
  columnFixed?: boolean | 'left' | 'right',
  className?: string,
  classPrefix?: string,
  style?: Object,

  onColumnResizeStart?: (client: Client) => void,
  onColumnResizeEnd?: (columnWidth?: number, cursorDelta?: number) => void,
  onColumnResizeMove?: (columnWidth?: number, columnLeft?: number, columnFixed?: boolean) => void
};

class ColumnResizeHandler extends React.Component<Props> {
  static defaultProps = {
    classPrefix: defaultClassPrefix('table-column-resize-spanner')
  };

  constructor(props: Props) {
    super(props);
    this.columnWidth = props.columnWidth || 0;
  }

  shouldComponentUpdate(nextProps: Props) {
    if (
      nextProps.initialEvent &&
      this.isKeyDown &&
      this.mouseMoveTracker &&
      !this.mouseMoveTracker.isDragging()
    ) {
      this.mouseMoveTracker.captureMouseMoves(nextProps.initialEvent);
    }

    if (nextProps.columnWidth !== this.props.columnWidth) {
      this.columnWidth = nextProps.columnWidth;
    }
    return true;
  }

  componentWillUnmount() {
    if (this.mouseMoveTracker) {
      this.mouseMoveTracker.releaseMouseMoves();
      this.mouseMoveTracker = null;
    }
  }

  onMove = (deltaX: number) => {
    if (!this.isKeyDown) {
      return;
    }

    const { onColumnResizeMove, columnWidth, columnLeft, columnFixed } = this.props;
    this.cursorDelta += deltaX;

    this.columnWidth = _.clamp(
      columnWidth + (isRTL() ? -this.cursorDelta : this.cursorDelta),
      20,
      20000
    );
    onColumnResizeMove && onColumnResizeMove(this.columnWidth, columnLeft, columnFixed);
  };
  onColumnResizeEnd = () => {
    const { onColumnResizeEnd } = this.props;
    this.isKeyDown = false;

    onColumnResizeEnd && onColumnResizeEnd(this.columnWidth, this.cursorDelta);

    if (this.mouseMoveTracker) {
      this.mouseMoveTracker.releaseMouseMoves();
      this.mouseMoveTracker = null;
    }
  };
  onColumnResizeMouseDown = (event: SyntheticMouseEvent<*>) => {
    const { onColumnResizeStart } = this.props;

    this.mouseMoveTracker = this.getMouseMoveTracker();
    this.isKeyDown = true;
    this.cursorDelta = 0;

    const client = {
      clientX: event.clientX,
      clientY: event.clientY,
      preventDefault: () => {}
    };

    onColumnResizeStart && onColumnResizeStart(client);
  };

  getMouseMoveTracker() {
    return (
      this.mouseMoveTracker ||
      new DOMMouseMoveTracker(this.onMove, this.onColumnResizeEnd, document.body)
    );
  }

  columnWidth = 0;
  cursorDelta = 0;
  mouseMoveTracker: any;
  isKeyDown: boolean;

  render() {
    const {
      columnLeft = 0,
      classPrefix,
      height,
      className,
      style,
      columnFixed,
      ...rest
    } = this.props;

    if (columnFixed === 'right') {
      return null;
    }

    const styles = {
      [isRTL() ? 'right' : 'left']: this.columnWidth + columnLeft - 2,
      height,
      ...style
    };

    const classes = classNames(classPrefix, className);
    const unhandled = getUnhandledProps(ColumnResizeHandler, rest);

    return (
      <div
        {...unhandled}
        className={classes}
        style={styles}
        onMouseDown={this.onColumnResizeMouseDown}
        role="button"
        tabIndex={-1}
      />
    );
  }
}

export default ColumnResizeHandler;
