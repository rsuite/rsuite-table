import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import clamp from 'lodash/clamp';
import { DOMMouseMoveTracker } from 'dom-lib';
import { defaultClassPrefix, getUnhandledProps } from './utils';
import TableContext from './TableContext';
import { RESIZE_MIN_WIDTH } from './constants';

export type FixedType = boolean | 'left' | 'right';
export interface Client {
  clientX?: number;
  clientY?: number;
  preventDefault?: Function;
}

export interface ColumnResizeHandlerProps {
  height?: number;
  defaultColumnWidth?: number;
  columnLeft?: number;
  columnFixed?: FixedType;
  className?: string;
  classPrefix?: string;
  minWidth?: number;
  style?: React.CSSProperties;
  onColumnResizeStart?: (client: Client) => void;
  onColumnResizeEnd?: (columnWidth?: number, cursorDelta?: number) => void;
  onColumnResizeMove?: (columnWidth?: number, columnLeft?: number, columnFixed?: FixedType) => void;
}

const propTypes = {
  height: PropTypes.number,
  defaultColumnWidth: PropTypes.number,
  columnLeft: PropTypes.number,
  columnFixed: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf(['left', 'right'])]),
  className: PropTypes.string,
  classPrefix: PropTypes.string,
  minWidth: PropTypes.number,
  style: PropTypes.object,
  onColumnResizeStart: PropTypes.func,
  onColumnResizeEnd: PropTypes.func,
  onColumnResizeMove: PropTypes.func
};
class ColumnResizeHandler extends React.Component<ColumnResizeHandlerProps> {
  static contextType = TableContext;
  static propTypes = propTypes;

  columnWidth = 0;
  cursorDelta = 0;
  mouseMoveTracker;
  isKeyDown: boolean;

  constructor(props) {
    super(props);
    this.columnWidth = props.defaultColumnWidth || 0;
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

    const { onColumnResizeMove, defaultColumnWidth, columnLeft, columnFixed } = this.props;
    const { rtl } = this.context;
    this.cursorDelta += deltaX;

    this.columnWidth = clamp(
      defaultColumnWidth + (rtl ? -this.cursorDelta : this.cursorDelta),
      this.props.minWidth ? Math.max(this.props.minWidth, RESIZE_MIN_WIDTH) : RESIZE_MIN_WIDTH,
      20000
    );
    onColumnResizeMove?.(this.columnWidth, columnLeft, columnFixed);
  };
  onColumnResizeEnd = () => {
    this.isKeyDown = false;
    this.props.onColumnResizeEnd?.(this.columnWidth, this.cursorDelta);
    this.mouseMoveTracker?.releaseMouseMoves?.();
    this.mouseMoveTracker = null;
  };
  onColumnResizeMouseDown = (event: React.MouseEvent) => {
    this.mouseMoveTracker = this.getMouseMoveTracker();
    this.mouseMoveTracker.captureMouseMoves(event);
    this.isKeyDown = true;
    this.cursorDelta = 0;

    const client = {
      clientX: event.clientX,
      clientY: event.clientY,
      preventDefault: Function()
    };

    this.props.onColumnResizeStart?.(client);
  };

  getMouseMoveTracker() {
    return (
      this.mouseMoveTracker ||
      new DOMMouseMoveTracker(this.onMove, this.onColumnResizeEnd, document.body)
    );
  }

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
    const { rtl } = this.context;
    const styles = {
      [rtl ? 'right' : 'left']: this.columnWidth + columnLeft - 2,
      height,
      ...style
    };

    const classes = classNames(
      classPrefix || defaultClassPrefix('table-column-resize-spanner', this.context.classPrefix),
      className
    );
    const unhandled = getUnhandledProps(propTypes, rest);

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
