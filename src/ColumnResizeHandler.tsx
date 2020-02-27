import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import clamp from 'lodash/clamp';
import { DOMMouseMoveTracker } from 'dom-lib';
import { defaultClassPrefix, getUnhandledProps, isRTL } from './utils';
import { ColumnResizeHandlerProps } from './ColumnResizeHandler.d';

class ColumnResizeHandler extends React.Component<ColumnResizeHandlerProps> {
  static propTypes = {
    height: PropTypes.number,
    initialEvent: PropTypes.object,
    columnWidth: PropTypes.number,
    columnLeft: PropTypes.number,
    columnFixed: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf(['left', 'right'])]),
    className: PropTypes.string,
    classPrefix: PropTypes.string,
    style: PropTypes.object,
    onColumnResizeStart: PropTypes.func,
    onColumnResizeEnd: PropTypes.func,
    onColumnResizeMove: PropTypes.func
  };
  static defaultProps = {
    classPrefix: defaultClassPrefix('table-column-resize-spanner')
  };

  constructor(props) {
    super(props);
    this.columnWidth = props.columnWidth || 0;
  }

  shouldComponentUpdate(nextProps: ColumnResizeHandlerProps) {
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

    this.columnWidth = clamp(
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
  onColumnResizeMouseDown = (event: React.MouseEvent) => {
    const { onColumnResizeStart } = this.props;

    this.mouseMoveTracker = this.getMouseMoveTracker();
    this.isKeyDown = true;
    this.cursorDelta = 0;

    const client = {
      clientX: event.clientX,
      clientY: event.clientY,
      preventDefault: () => undefined
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
