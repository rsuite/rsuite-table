import React, { useRef, useCallback, useEffect } from 'react';
import { getWidth, getHeight, getOffset } from 'dom-lib';
import useControlled from './useControlled';
import { SCROLLBAR_WIDTH } from '../constants';
import debounce from 'lodash/debounce';
import bindElementResize, { unbind as unbindElementResize } from 'element-resize-event';
import useMount from './useMount';
import useUpdateEffect from './useUpdateEffect';
import isNumberOrTrue from './isNumberOrTrue';
import { RowDataType, ElementOffset } from '../@types/common';

interface TableDimensionProps {
  data?: RowDataType[];
  rowHeight?: number | ((rowData?: RowDataType) => number);
  height?: number;
  tableRef?: React.RefObject<HTMLDivElement>;
  headerWrapperRef?: React.RefObject<HTMLDivElement>;
  width?: number;
  prefix?: (str: string) => string;
  affixHeader?: boolean | number;
  affixHorizontalScrollbar?: boolean | number;
  headerHeight?: number;
  autoHeight?: boolean;
  children?: React.ReactNode;
  expandedRowKeys?: string[];
  resetScrollBarPosition?: () => void;
  onTableHeightChange?: (y: number) => void;
  onTableWidthChange?: () => void;
}

const useTableDimension = (props: TableDimensionProps) => {
  const {
    data,
    rowHeight,
    tableRef,
    headerWrapperRef,
    prefix,
    width: widthProp,
    affixHeader,
    affixHorizontalScrollbar,
    headerHeight,
    height,
    autoHeight,
    children,
    expandedRowKeys,
    resetScrollBarPosition,
    onTableWidthChange,
    onTableHeightChange
  } = props;

  const contentHeight = useRef(0);
  const contentWidth = useRef(0);
  const minScrollY = useRef(0);
  const scrollY = useRef(0);
  const scrollX = useRef(0);
  const minScrollX = useRef(0);
  const tableWidth = useRef(0);

  const headerOffset = useRef<ElementOffset>(null);
  const tableOffset = useRef<ElementOffset>(null);

  const [width, setWidth] = useControlled(widthProp, 0);

  const calculateTableContextHeight = useCallback(() => {
    const table = tableRef.current;
    const rows = table.querySelectorAll(`.${prefix('row')}`) || [];
    const nextContentHeight = rows.length
      ? (Array.from(rows)
          .map((row: Element) => getHeight(row) || rowHeight)
          .reduce((x: number, y: number) => x + y) as number)
      : 0;

    // After setting the affixHeader property, the height of the two headers should be subtracted.
    contentHeight.current = nextContentHeight - (affixHeader ? headerHeight * 2 : headerHeight);

    if (!autoHeight) {
      // The purpose of subtracting SCROLLBAR_WIDTH is to keep the scroll bar from blocking the content part.
      minScrollY.current = -(nextContentHeight - height) - SCROLLBAR_WIDTH;
    }

    // If the height of the content area is less than the height of the table, the vertical scroll bar is reset.
    if (nextContentHeight < height) {
      onTableHeightChange(0);
    }

    // If the value of scrollTop is greater than the scrollable range, the vertical scroll bar is reset.
    // When Table is set to virtualized, the logic will be entered every time the wheel event is triggered
    // to avoid resetting the scroll bar after scrolling to the bottom, so add the SCROLLBAR_WIDTH value.
    if (Math.abs(scrollY.current) + height - headerHeight > nextContentHeight + SCROLLBAR_WIDTH) {
      onTableHeightChange(scrollY.current);
    }
  }, [
    affixHeader,
    autoHeight,
    headerHeight,
    height,
    onTableHeightChange,
    prefix,
    rowHeight,
    tableRef
  ]);

  const setOffsetByAffix = useCallback(() => {
    const headerNode = headerWrapperRef?.current;
    if (isNumberOrTrue(affixHeader) && headerNode) {
      headerOffset.current = getOffset(headerNode);
    }

    if (isNumberOrTrue(affixHorizontalScrollbar) && tableRef?.current) {
      tableOffset.current = getOffset(tableRef?.current);
    }
  }, [affixHeader, affixHorizontalScrollbar, headerWrapperRef, tableRef]);

  const calculateTableContentWidth = useCallback(() => {
    const table = tableRef?.current;
    const row = table.querySelector(`.${prefix('row')}:not(.virtualized)`);
    const nextContentWidth = row ? getWidth(row) : 0;

    contentWidth.current = nextContentWidth;

    // The value of SCROLLBAR_WIDTH is subtracted so that the scroll bar does not block the content part
    minScrollX.current = -(nextContentWidth - tableWidth.current) - SCROLLBAR_WIDTH;
  }, [prefix, tableRef]);

  const calculateTableWidth = useCallback(() => {
    if (tableRef?.current) {
      const nextWidth = getWidth(tableRef?.current);
      if (width !== nextWidth) {
        scrollX.current = 0;
        resetScrollBarPosition();
      }
      setWidth(nextWidth);
      tableWidth.current = nextWidth;
    }
    onTableWidthChange?.();
    setOffsetByAffix();
  }, [onTableWidthChange, resetScrollBarPosition, setOffsetByAffix, setWidth, tableRef, width]);

  useMount(() => {
    calculateTableWidth();
    calculateTableContextHeight();
    calculateTableContentWidth();
    setOffsetByAffix();
    bindElementResize(tableRef.current, debounce(calculateTableWidth, 400));
  });

  useUpdateEffect(() => {
    calculateTableContextHeight();
    calculateTableContentWidth();
  }, [data, height, contentHeight, expandedRowKeys, children]);

  useEffect(() => {
    return () => {
      if (tableRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        unbindElementResize(tableRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setScrollY = useCallback((value: number) => {
    scrollY.current = value;
  }, []);

  const setScrollX = useCallback((value: number) => {
    scrollX.current = value;
  }, []);

  return {
    contentHeight,
    contentWidth,
    minScrollY,
    minScrollX,
    scrollY,
    scrollX,
    tableWidth,
    headerOffset,
    tableOffset,
    setScrollY,
    setScrollX
  };
};

export default useTableDimension;
