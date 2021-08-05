import React, { useRef, useCallback, useState, useEffect } from 'react';
import { WheelHandler, scrollLeft, scrollTop, on } from 'dom-lib';
import { requestAnimationTimeout, cancelAnimationTimeout } from './requestAnimationTimeout';
import useUpdateEffect from './useUpdateEffect';
import useMount from './useMount';
import { SCROLLBAR_WIDTH } from '../constants';
import type { ScrollbarInstance } from '../Scrollbar';
import type { ListenerCallback, RowDataType } from '../@types/common';

interface ScrollListenerProps {
  rtl: boolean;
  data: RowDataType[];
  children: React.ReactNode;
  height: number;
  getTableHeight: () => number;
  contentHeight: React.RefObject<number>;
  headerHeight: number;
  autoHeight: boolean;
  tableBodyRef: React.RefObject<HTMLDivElement>;
  scrollbarXRef: React.RefObject<ScrollbarInstance>;
  scrollbarYRef: React.RefObject<ScrollbarInstance>;
  disabledScroll: boolean;
  loading: boolean;
  tableRef: React.RefObject<HTMLDivElement>;
  contentWidth: React.RefObject<number>;
  tableWidth: React.RefObject<number>;
  scrollY: React.RefObject<number>;
  minScrollY: React.RefObject<number>;
  minScrollX: React.RefObject<number>;
  scrollX: React.RefObject<number>;
  setScrollX: (v: number) => void;
  setScrollY: (v: number) => void;
  virtualized: boolean;
  forceUpdatePosition: () => void;
  onScroll: (scrollX: number, scrollY: number) => void;
  onTouchStart?: (event: React.TouchEvent) => void;
  onTouchMove?: (event: React.TouchEvent) => void;
}

const useScrollListener = (props: ScrollListenerProps) => {
  const {
    data,
    children,
    autoHeight,
    tableBodyRef,
    scrollbarXRef,
    scrollbarYRef,
    disabledScroll,
    loading,
    tableRef,
    contentWidth,
    tableWidth,
    scrollY,
    minScrollY,
    minScrollX,
    scrollX,
    setScrollX,
    setScrollY,
    virtualized,
    forceUpdatePosition,
    onScroll,
    onTouchMove,
    onTouchStart,
    height,
    getTableHeight,
    contentHeight,
    headerHeight,
    rtl
  } = props;

  const wheelListener = useRef<ListenerCallback>();
  const touchStartListener = useRef<ListenerCallback>();
  const touchMoveListener = useRef<ListenerCallback>();

  const [isScrolling, setScrolling] = useState(false);
  const touchX = useRef(0);
  const touchY = useRef(0);
  const disableEventsTimeoutId = useRef(null);

  const shouldHandleWheelX = useCallback(
    (delta: number) => {
      if (delta === 0 || disabledScroll || loading) {
        return false;
      }

      return true;
    },
    [disabledScroll, loading]
  );

  const shouldHandleWheelY = useCallback(
    (delta: number) => {
      if (delta === 0 || disabledScroll || loading) {
        return false;
      }
      return (
        (delta >= 0 && scrollY.current > minScrollY.current) || (delta < 0 && scrollY.current < 0)
      );
    },
    [disabledScroll, loading, minScrollY, scrollY]
  );

  const debounceScrollEndedCallback = useCallback(() => {
    disableEventsTimeoutId.current = null;
    setScrolling(false);
  }, []);

  const handleWheel = useCallback(
    (deltaX: number, deltaY: number) => {
      if (!tableRef.current) {
        return;
      }

      const nextScrollX = contentWidth.current <= tableWidth.current ? 0 : scrollX.current - deltaX;
      const nextScrollY = scrollY.current - deltaY;

      const y = Math.min(0, nextScrollY < minScrollY.current ? minScrollY.current : nextScrollY);
      const x = Math.min(0, nextScrollX < minScrollX.current ? minScrollX.current : nextScrollX);

      setScrollX(x);
      setScrollY(y);
      onScroll?.(x, y);

      forceUpdatePosition();

      if (virtualized) {
        setScrolling(true);
        if (disableEventsTimeoutId.current) {
          cancelAnimationTimeout(disableEventsTimeoutId.current);
        }

        disableEventsTimeoutId.current = requestAnimationTimeout(debounceScrollEndedCallback, 0);
      }
    },
    [
      contentWidth,
      debounceScrollEndedCallback,
      minScrollX,
      minScrollY,
      onScroll,
      scrollX,
      scrollY,
      setScrollX,
      setScrollY,
      tableRef,
      tableWidth,
      forceUpdatePosition,
      virtualized
    ]
  );

  const listenWheel = useCallback(
    (deltaX: number, deltaY: number) => {
      handleWheel(deltaX, deltaY);

      scrollbarXRef.current?.onWheelScroll?.(deltaX);
      scrollbarYRef.current?.onWheelScroll?.(deltaY);
    },
    [handleWheel, scrollbarXRef, scrollbarYRef]
  );

  const wheelHandler = useRef<WheelHandler>(
    new WheelHandler(listenWheel, shouldHandleWheelX, shouldHandleWheelY, false)
  );

  // When handling the Touch event on the mobile terminal, initialize x and y when Start.
  const handleTouchStart = useCallback(
    (event: React.TouchEvent) => {
      if (event.touches) {
        const { pageX, pageY } = event.touches[0];
        touchX.current = pageX;
        touchY.current = pageY;
      }

      onTouchStart?.(event);
    },
    [onTouchStart]
  );

  // Handle Touch events on the mobile terminal, initialize when Move, and update the scroll bar.
  const handleTouchMove = useCallback(
    (event: React.TouchEvent) => {
      if (event.touches) {
        const { pageX, pageY } = event.touches[0];
        const deltaX = touchX.current - pageX;
        const deltaY = autoHeight ? 0 : touchY.current - pageY;

        if (!shouldHandleWheelY(deltaY) && !shouldHandleWheelX(deltaX)) {
          return;
        }

        event.preventDefault?.();

        handleWheel(deltaX, deltaY);
        scrollbarXRef.current?.onWheelScroll?.(deltaX);
        scrollbarYRef.current?.onWheelScroll?.(deltaY);

        touchX.current = pageX;
        touchY.current = pageY;
      }

      onTouchMove?.(event);
    },
    [
      autoHeight,
      handleWheel,
      onTouchMove,
      scrollbarXRef,
      scrollbarYRef,
      shouldHandleWheelX,
      shouldHandleWheelY
    ]
  );

  const handleHorizontalScroll = useCallback(
    (delta: number) => {
      handleWheel(delta, 0);
    },
    [handleWheel]
  );

  const handleVerticalScroll = useCallback(
    (delta: number) => {
      handleWheel(0, delta);
    },
    [handleWheel]
  );

  /**
   * When the user uses the tab key in the Table, the onScroll event is triggered,
   * and the scroll bar position should be updated at the same time.
   * https://github.com/rsuite/rsuite/issues/234
   */
  const handleBodyScroll = useCallback(
    event => {
      if (event.target !== tableBodyRef.current) {
        return;
      }

      const left = scrollLeft(event.target);
      const top = scrollTop(event.target);

      if (top === 0 && left === 0) {
        return;
      }

      listenWheel(left, top);

      scrollLeft(event.target, 0);
      scrollTop(event.target, 0);
    },
    [listenWheel, tableBodyRef]
  );

  const getControlledScrollTopValue = useCallback(
    value => {
      if (autoHeight) {
        return [0, 0];
      }

      const height = getTableHeight();

      // The maximum range of scrolling value is judged.
      value = Math.min(value, Math.max(0, contentHeight.current - (height - headerHeight)));

      // The value is a value of the theoretical scroll position of the table,
      // and the scrollY coordinate value and the value of the scroll bar position are calculated by value.
      return [-value, (value / contentHeight.current) * (height - headerHeight)];
    },
    [autoHeight, contentHeight, getTableHeight, headerHeight]
  );

  const handleScrollTop = useCallback(
    (top = 0) => {
      const [nextScrollY, handleScrollY] = getControlledScrollTopValue(top);

      setScrollY(nextScrollY);
      scrollbarYRef?.current?.resetScrollBarPosition?.(handleScrollY);
      forceUpdatePosition();

      /**
       * 当开启 virtualized，调用 scrollTop 后会出现白屏现象，
       * 原因是直接操作 DOM 的坐标，但是组件没有重新渲染，需要调用 forceUpdate 重新进入 render。
       * Fix: rsuite#1044
       */
      if (virtualized && contentHeight.current > height) {
        // TODO
        // this.forceUpdate();
      }
    },
    [
      contentHeight,
      getControlledScrollTopValue,
      height,
      scrollbarYRef,
      setScrollY,
      forceUpdatePosition,
      virtualized
    ]
  );

  const getControlledScrollLeftValue = value => {
    // The maximum range of scrolling value is judged.
    value = Math.min(value, Math.max(0, contentWidth.current - tableWidth.current));

    return [-value, (value / contentWidth.current) * tableWidth.current];
  };

  const handleScrollLeft = (left = 0) => {
    const [nextScrollX, scrollbarX] = getControlledScrollLeftValue(left);
    setScrollX(nextScrollX);
    scrollbarXRef?.current?.resetScrollBarPosition?.(scrollbarX);
    forceUpdatePosition();
  };

  const handleScrollTo = (coord: { x: number; y: number }) => {
    const { x, y } = coord || {};
    if (typeof x === 'number') {
      handleScrollLeft(x);
    }
    if (typeof y === 'number') {
      handleScrollTop(y);
    }
  };

  useUpdateEffect(() => {
    handleScrollLeft(0);
  }, [children, contentWidth.current]);

  useUpdateEffect(() => {
    if (scrollY.current !== 0) {
      handleScrollTop(Math.abs(scrollY.current));
    }
  }, [height, data]);

  useEffect(() => {
    const options = { passive: false };
    const tableBody = tableBodyRef.current;
    if (tableBody) {
      wheelListener.current = on(tableBody, 'wheel', wheelHandler.current.onWheel, options);
      touchStartListener.current = on(tableBody, 'touchstart', handleTouchStart, options);
      touchMoveListener.current = on(tableBody, 'touchmove', handleTouchMove, options);
    }
    return () => {
      wheelHandler.current = null;
      wheelListener.current?.off();
      touchStartListener.current?.off();
      touchMoveListener.current?.off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMount(() => {
    if (rtl) {
      // Initialize scroll position
      setTimeout(() => {
        setScrollX(tableWidth.current - contentWidth.current - SCROLLBAR_WIDTH);
        scrollbarXRef?.current?.resetScrollBarPosition?.(-scrollX.current);
        forceUpdatePosition();
      }, 0);
    }
  });

  return {
    isScrolling,
    handleHorizontalScroll,
    handleVerticalScroll,
    handleBodyScroll,
    handleScrollTop,
    handleScrollLeft,
    handleScrollTo
  };
};

export default useScrollListener;
