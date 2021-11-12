import React, { useCallback, useRef } from 'react';
import addStyle from 'dom-lib/addStyle';
import { SCROLLBAR_WIDTH } from '../constants';
import toggleClass from './toggleClass';
import useUpdateEffect from './useUpdateEffect';
import type { RowDataType } from '../@types/common';
import isSupportTouchEvent from './isSupportTouchEvent';

interface PositionProps {
  data: RowDataType[];
  height: number;
  tableWidth: React.RefObject<number>;
  tableRef: React.RefObject<HTMLDivElement>;
  prefix: (str: string) => string;
  translateDOMPositionXY: React.RefObject<any>;
  wheelWrapperRef: React.RefObject<HTMLDivElement>;
  headerWrapperRef: React.RefObject<HTMLDivElement>;
  affixHeaderWrapperRef: React.RefObject<HTMLDivElement>;
  tableHeaderRef: React.RefObject<HTMLDivElement>;
  scrollX: React.RefObject<number>;
  scrollY: React.RefObject<number>;
  contentWidth: React.RefObject<number>;
  shouldFixedColumn: boolean;
}

/**
 * Update the position of the table according to the scrolling information of the table.
 * @param props
 * @returns
 */
const usePosition = (props: PositionProps) => {
  const {
    data,
    height,
    tableWidth,
    tableRef,
    prefix,
    translateDOMPositionXY,
    wheelWrapperRef,
    headerWrapperRef,
    affixHeaderWrapperRef,
    tableHeaderRef,
    scrollX,
    scrollY,
    contentWidth,
    shouldFixedColumn
  } = props;

  const duration = useRef(0);
  const bezier = useRef('linear');

  const getScrollCellGroups = useCallback(() => {
    return tableRef.current?.querySelectorAll(`.${prefix('cell-group-scroll')}`);
  }, [prefix, tableRef]);

  const getFixedLeftCellGroups = useCallback(() => {
    return tableRef.current?.querySelectorAll(`.${prefix('cell-group-fixed-left')}`);
  }, [prefix, tableRef]);

  const getFixedRightCellGroups = useCallback(() => {
    return tableRef.current?.querySelectorAll(`.${prefix('cell-group-fixed-right')}`);
  }, [prefix, tableRef]);

  const updateWheelElementPosition = useCallback(
    (fixedCell?: boolean) => {
      if (wheelWrapperRef?.current) {
        const wheelStyle = isSupportTouchEvent()
          ? {
              'transition-duration': `${duration.current}ms`,
              'transition-timing-function': bezier.current
            }
          : {};
        translateDOMPositionXY.current(
          wheelStyle,
          fixedCell ? 0 : scrollX.current,
          scrollY.current
        );
        addStyle(wheelWrapperRef.current, wheelStyle);
      }
    },
    [scrollX, scrollY, translateDOMPositionXY, wheelWrapperRef]
  );

  const updatePositionByFixedCell = useCallback(() => {
    const wheelGroupStyle = {};
    const scrollGroups = getScrollCellGroups();
    const fixedLeftGroups = getFixedLeftCellGroups();
    const fixedRightGroups = getFixedRightCellGroups();

    translateDOMPositionXY.current(wheelGroupStyle as CSSStyleDeclaration, scrollX.current, 0);

    const scrollArrayGroups = Array.from(scrollGroups);

    for (let i = 0; i < scrollArrayGroups.length; i++) {
      const group = scrollArrayGroups[i] as Element;
      addStyle(group, wheelGroupStyle);
    }

    updateWheelElementPosition(true);

    const leftShadowClassName = prefix('cell-group-left-shadow');
    const rightShadowClassName = prefix('cell-group-right-shadow');
    const showLeftShadow = scrollX.current < 0;
    const showRightShadow =
      tableWidth.current - contentWidth.current - SCROLLBAR_WIDTH !== scrollX.current;

    toggleClass(fixedLeftGroups as unknown as HTMLElement[], leftShadowClassName, showLeftShadow);
    toggleClass(
      fixedRightGroups as unknown as HTMLElement[],
      rightShadowClassName,
      showRightShadow
    );
  }, [
    contentWidth,
    getFixedLeftCellGroups,
    getFixedRightCellGroups,
    getScrollCellGroups,
    updateWheelElementPosition,
    prefix,
    scrollX,
    tableWidth,
    translateDOMPositionXY
  ]);

  /**
   * Update the position of the table according to the scrolling information of the table.
   * @param nextDuration CSS transition-duration
   * @param nextBezier CSS transition-timing-function
   */
  const updatePosition = useCallback(
    (nextDuration?: number, nextBezier?: string) => {
      duration.current = nextDuration;
      bezier.current = nextBezier;

      // When there are fixed columns.
      if (shouldFixedColumn) {
        updatePositionByFixedCell();
      } else {
        const headerStyle = {};

        translateDOMPositionXY.current(headerStyle as CSSStyleDeclaration, scrollX.current, 0);

        const headerElement = headerWrapperRef?.current;
        const affixHeaderElement = affixHeaderWrapperRef?.current;

        updateWheelElementPosition();
        headerElement && addStyle(headerElement, headerStyle);

        if (affixHeaderElement?.hasChildNodes?.()) {
          addStyle(affixHeaderElement?.firstChild as Element, headerStyle);
        }
      }

      if (tableHeaderRef?.current) {
        toggleClass(tableHeaderRef.current, prefix('cell-group-shadow'), scrollY.current < 0);
      }
    },
    [
      affixHeaderWrapperRef,
      updateWheelElementPosition,
      headerWrapperRef,
      prefix,
      scrollX,
      scrollY,
      shouldFixedColumn,
      tableHeaderRef,
      translateDOMPositionXY,
      updatePositionByFixedCell
    ]
  );

  useUpdateEffect(() => {
    if (scrollY.current !== 0) {
      updatePosition();
    }
  }, [height, data]);

  return {
    forceUpdatePosition: updatePosition
  };
};

export default usePosition;
