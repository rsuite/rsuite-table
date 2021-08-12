import React, { useCallback } from 'react';
import { addStyle } from 'dom-lib';
import { SCROLLBAR_WIDTH } from '../constants';
import toggleClass from './toggleClass';
import useUpdateEffect from './useUpdateEffect';
import type { RowDataType } from '../@types/common';

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

  const getScrollCellGroups = useCallback(() => {
    return tableRef.current?.querySelectorAll(`.${prefix('cell-group-scroll')}`);
  }, [prefix, tableRef]);

  const getFixedLeftCellGroups = useCallback(() => {
    return tableRef.current?.querySelectorAll(`.${prefix('cell-group-fixed-left')}`);
  }, [prefix, tableRef]);

  const getFixedRightCellGroups = useCallback(() => {
    return tableRef.current?.querySelectorAll(`.${prefix('cell-group-fixed-right')}`);
  }, [prefix, tableRef]);

  const updatePositionByFixedCell = useCallback(() => {
    const wheelGroupStyle = {};
    const wheelStyle = {};
    const scrollGroups = getScrollCellGroups();
    const fixedLeftGroups = getFixedLeftCellGroups();
    const fixedRightGroups = getFixedRightCellGroups();

    translateDOMPositionXY.current(wheelGroupStyle as CSSStyleDeclaration, scrollX.current, 0);
    translateDOMPositionXY.current(wheelStyle as CSSStyleDeclaration, 0, scrollY.current);

    const scrollArrayGroups = Array.from(scrollGroups);

    for (let i = 0; i < scrollArrayGroups.length; i++) {
      const group = scrollArrayGroups[i] as Element;
      addStyle(group, wheelGroupStyle);
    }

    if (wheelWrapperRef?.current) {
      addStyle(wheelWrapperRef.current, wheelStyle);
    }

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
    prefix,
    scrollX,
    scrollY,
    tableWidth,
    translateDOMPositionXY,
    wheelWrapperRef
  ]);

  const updatePosition = useCallback(() => {
    // When there are fixed columns.
    if (shouldFixedColumn) {
      updatePositionByFixedCell();
    } else {
      const wheelStyle = {};
      const headerStyle = {};

      translateDOMPositionXY.current(
        wheelStyle as CSSStyleDeclaration,
        scrollX.current,
        scrollY.current
      );
      translateDOMPositionXY.current(headerStyle as CSSStyleDeclaration, scrollX.current, 0);

      const wheelElement = wheelWrapperRef?.current;
      const headerElement = headerWrapperRef?.current;
      const affixHeaderElement = affixHeaderWrapperRef?.current;

      wheelElement && addStyle(wheelElement, wheelStyle);
      headerElement && addStyle(headerElement, headerStyle);

      if (affixHeaderElement?.hasChildNodes?.()) {
        addStyle(affixHeaderElement?.firstChild as Element, headerStyle);
      }
    }

    if (tableHeaderRef?.current) {
      toggleClass(tableHeaderRef.current, prefix('cell-group-shadow'), scrollY.current < 0);
    }
  }, [
    affixHeaderWrapperRef,
    headerWrapperRef,
    prefix,
    scrollX,
    scrollY,
    shouldFixedColumn,
    tableHeaderRef,
    translateDOMPositionXY,
    updatePositionByFixedCell,
    wheelWrapperRef
  ]);

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
