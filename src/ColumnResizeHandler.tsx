import React, { useCallback, useContext, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import clamp from 'lodash/clamp';
import { DOMMouseMoveTracker } from 'dom-lib';
import { useClassNames } from './utils';
import TableContext from './TableContext';
import { RESIZE_MIN_WIDTH } from './constants';
import type { StandardProps } from './@types/common';

export type FixedType = boolean | 'left' | 'right';
export interface Client {
  clientX?: number;
  clientY?: number;
  preventDefault?: any;
}

export interface ColumnResizeHandlerProps extends StandardProps {
  height?: number;
  defaultColumnWidth?: number;
  columnLeft?: number;
  columnFixed?: FixedType;
  minWidth?: number;
  onColumnResizeStart?: (client: Client) => void;
  onColumnResizeEnd?: (columnWidth?: number, cursorDelta?: number) => void;
  onColumnResizeMove?: (columnWidth?: number, columnLeft?: number, columnFixed?: FixedType) => void;
}

const ColumnResizeHandler = React.forwardRef(
  (props: ColumnResizeHandlerProps, ref: React.Ref<HTMLDivElement>) => {
    const {
      columnLeft,
      classPrefix,
      height,
      className,
      style,
      columnFixed,
      defaultColumnWidth,
      minWidth,
      onColumnResizeStart,
      onColumnResizeMove,
      onColumnResizeEnd,
      ...rest
    } = props;

    const { rtl } = useContext(TableContext);
    const { withClassPrefix, merge } = useClassNames(classPrefix);
    const classes = merge(className, withClassPrefix());

    const columnWidth = useRef(defaultColumnWidth || 0);
    const mouseMoveTracker = useRef<DOMMouseMoveTracker>();
    const isKeyDown = useRef<boolean>();
    const cursorDelta = useRef<number>();

    const handleMove = useCallback(
      (deltaX: number) => {
        if (!isKeyDown.current) {
          return;
        }

        cursorDelta.current += deltaX;
        columnWidth.current = clamp(
          defaultColumnWidth + (rtl ? -cursorDelta.current : cursorDelta.current),
          minWidth ? Math.max(minWidth, RESIZE_MIN_WIDTH) : RESIZE_MIN_WIDTH,
          20000
        );
        onColumnResizeMove?.(columnWidth.current, columnLeft, columnFixed);
      },
      [columnFixed, columnLeft, defaultColumnWidth, minWidth, onColumnResizeMove, rtl]
    );

    const handleColumnResizeEnd = useCallback(() => {
      isKeyDown.current = false;
      onColumnResizeEnd?.(columnWidth.current, cursorDelta.current);
      mouseMoveTracker.current?.releaseMouseMoves?.();
      mouseMoveTracker.current = null;
    }, [onColumnResizeEnd]);

    const getMouseMoveTracker = useCallback(() => {
      return (
        mouseMoveTracker.current ||
        new DOMMouseMoveTracker(handleMove, handleColumnResizeEnd, document.body)
      );
    }, [handleColumnResizeEnd, handleMove]);

    const handleColumnResizeMouseDown = useCallback(
      (event: React.MouseEvent) => {
        mouseMoveTracker.current = getMouseMoveTracker();
        mouseMoveTracker.current.captureMouseMoves(event);
        isKeyDown.current = true;
        cursorDelta.current = 0;

        const client = {
          clientX: event.clientX,
          clientY: event.clientY,
          preventDefault: Function()
        };

        onColumnResizeStart?.(client);
      },
      [getMouseMoveTracker, onColumnResizeStart]
    );

    useEffect(() => {
      return () => {
        mouseMoveTracker.current?.releaseMouseMoves();
        mouseMoveTracker.current = null;
      };
    }, []);

    if (columnFixed === 'right') {
      return null;
    }

    const styles = {
      [rtl ? 'right' : 'left']: columnWidth.current + columnLeft - 2,
      height,
      ...style
    };

    return (
      <div
        tabIndex={-1}
        role="button"
        ref={ref}
        {...rest}
        className={classes}
        style={styles}
        onMouseDown={handleColumnResizeMouseDown}
      />
    );
  }
);

ColumnResizeHandler.displayName = 'Table.ColumnResizeHandler';
ColumnResizeHandler.defaultProps = {
  columnLeft: 0,
  classPrefix: 'column-resize-spanner'
};
ColumnResizeHandler.propTypes = {
  height: PropTypes.number,
  defaultColumnWidth: PropTypes.number,
  columnLeft: PropTypes.number,
  columnFixed: PropTypes.any,
  className: PropTypes.string,
  classPrefix: PropTypes.string,
  minWidth: PropTypes.number,
  style: PropTypes.object,
  onColumnResizeStart: PropTypes.func,
  onColumnResizeEnd: PropTypes.func,
  onColumnResizeMove: PropTypes.func
};

export default ColumnResizeHandler;
