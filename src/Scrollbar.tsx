import React, { useState, useRef, useCallback, useEffect, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';

import { DOMMouseMoveTracker, addStyle, getOffset } from 'dom-lib';
import { SCROLLBAR_MIN_WIDTH } from './constants';
import { useMount, useClassNames } from './utils';
import TableContext from './TableContext';
import type { StandardProps } from './@types/common';

export interface ScrollbarProps extends Omit<StandardProps, 'onScroll'> {
  vertical?: boolean;
  length: number;
  scrollLength: number;
  tableId?: string;
  onScroll?: (delta: number, event: React.MouseEvent) => void;
  onMouseDown?: (event: React.MouseEvent) => void;
}

export interface ScrollbarInstance {
  root: HTMLDivElement;
  onWheelScroll: (delta: number) => void;
  resetScrollBarPosition: (forceDelta?: number) => void;
}

const Scrollbar = React.forwardRef((props: ScrollbarProps, ref) => {
  const {
    vertical,
    length,
    scrollLength,
    classPrefix,
    className,
    tableId,
    onMouseDown,
    onScroll,
    ...rest
  } = props;

  const { translateDOMPositionXY } = React.useContext(TableContext);

  const [handlePressed, setHandlePressed] = useState(false);
  const [barOffset, setBarOffset] = useState({ top: 0, left: 0 });
  const scrollOffset = useRef(0);
  const barRef = useRef<HTMLDivElement>();
  const handleRef = useRef<HTMLDivElement>();
  const mouseMoveTracker = useRef<DOMMouseMoveTracker>();

  const { withClassPrefix, merge, prefix } = useClassNames(classPrefix);
  const classes = merge(
    className,
    withClassPrefix({
      vertical,
      horizontal: !vertical,
      hide: scrollLength <= length,
      pressed: handlePressed
    })
  );

  const width = (length / scrollLength) * 100;
  const styles: React.CSSProperties = {
    [vertical ? 'height' : 'width']: `${width}%`,
    [vertical ? 'minHeight' : 'minWidth']: SCROLLBAR_MIN_WIDTH
  };
  const valuenow = (scrollOffset.current / length) * 100 + width;

  useMount(() => {
    setTimeout(() => {
      if (barRef.current) {
        setBarOffset(getOffset(barRef.current));
      }
    }, 1);
  });

  useEffect(() => {
    return () => {
      releaseMouseMoves();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({
    get root() {
      return barRef.current;
    },
    get handle() {
      return handleRef.current;
    },
    onWheelScroll: (delta: number) => {
      const nextDelta = delta / (scrollLength / length);
      updateScrollBarPosition(nextDelta);
    },
    resetScrollBarPosition: (forceDelta = 0) => {
      scrollOffset.current = 0;
      updateScrollBarPosition(0, forceDelta);
    }
  }));

  const updateScrollBarPosition = useCallback(
    (delta: number, forceDelta?: number) => {
      const max =
        scrollLength && length
          ? length - Math.max((length / scrollLength) * length, SCROLLBAR_MIN_WIDTH + 2)
          : 0;
      const styles = {};

      if (typeof forceDelta === 'undefined') {
        scrollOffset.current += delta;
        scrollOffset.current = Math.max(scrollOffset.current, 0);
        scrollOffset.current = Math.min(scrollOffset.current, max);
      } else {
        scrollOffset.current = forceDelta || 0;
      }

      if (vertical) {
        translateDOMPositionXY?.(styles, 0, scrollOffset.current);
      } else {
        translateDOMPositionXY?.(styles, scrollOffset.current, 0);
      }

      addStyle(handleRef.current, styles);
    },
    [length, scrollLength, translateDOMPositionXY, vertical]
  );

  const handleScroll = useCallback(
    (delta: number, event: React.MouseEvent) => {
      const scrollDelta = delta * (scrollLength / length);

      updateScrollBarPosition(delta);
      onScroll?.(scrollDelta, event);
    },
    [length, onScroll, scrollLength, updateScrollBarPosition]
  );

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      if (handleRef.current && handleRef.current?.contains(event.target as Node)) {
        return;
      }

      const offset = vertical ? event.pageY - barOffset.top : event.pageX - barOffset.left;

      const handleWidth = (length / scrollLength) * length;
      const delta = offset - handleWidth;

      const nextDelta =
        offset > scrollOffset.current
          ? delta - scrollOffset.current
          : offset - scrollOffset.current;
      handleScroll(nextDelta, event);
    },
    [barOffset.left, barOffset.top, handleScroll, length, scrollLength, vertical]
  );

  const releaseMouseMoves = useCallback(() => {
    mouseMoveTracker.current?.releaseMouseMoves?.();
    mouseMoveTracker.current = null;
  }, []);

  const handleDragMove = useCallback(
    (deltaX: number, deltaY: number, event: React.MouseEvent) => {
      if (!mouseMoveTracker.current || !mouseMoveTracker.current.isDragging()) {
        return;
      }

      if (event?.buttons === 0 || window?.event?.['buttons'] === 0) {
        releaseMouseMoves();
        return;
      }

      handleScroll(vertical ? deltaY : deltaX, event);
    },
    [handleScroll, releaseMouseMoves, vertical]
  );

  const handleDragEnd = useCallback(() => {
    releaseMouseMoves();
    setHandlePressed(false);
  }, [releaseMouseMoves]);

  const getMouseMoveTracker = useCallback(() => {
    return (
      mouseMoveTracker.current ||
      new DOMMouseMoveTracker(handleDragMove, handleDragEnd, document.body)
    );
  }, [handleDragEnd, handleDragMove]);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      mouseMoveTracker.current = getMouseMoveTracker();
      mouseMoveTracker?.current?.captureMouseMoves(event);

      setHandlePressed(true);
      onMouseDown?.(event);
    },
    [getMouseMoveTracker, onMouseDown]
  );

  return (
    <div
      role="scrollbar"
      aria-controls={tableId}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={valuenow}
      aria-orientation={vertical ? 'vertical' : 'horizontal'}
      {...rest}
      ref={barRef}
      className={classes}
      onClick={handleClick}
    >
      <div
        ref={handleRef}
        className={prefix('handle')}
        style={styles}
        onMouseDown={handleMouseDown}
        role="button"
        tabIndex={-1}
      />
    </div>
  );
});

Scrollbar.displayName = 'Table.Scrollbar';
Scrollbar.propTypes = {
  tableId: PropTypes.string,
  vertical: PropTypes.bool,
  length: PropTypes.number,
  scrollLength: PropTypes.number,
  className: PropTypes.string,
  classPrefix: PropTypes.string,
  onScroll: PropTypes.func,
  onMouseDown: PropTypes.func
};
Scrollbar.defaultProps = {
  classPrefix: 'scrollbar',
  scrollLength: 1,
  length: 1
};

export default Scrollbar;
