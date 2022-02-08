import React, { useRef, useCallback, useEffect } from 'react';
import getWidth from 'dom-lib/getWidth';
import getHeight from 'dom-lib/getHeight';
import getOffset from 'dom-lib/getOffset';
import { SCROLLBAR_WIDTH } from '../constants';
import { ResizeObserver } from '@juggle/resize-observer';
import useMount from './useMount';
import useUpdateLayoutEffect from './useUpdateLayoutEffect';
import isNumberOrTrue from './isNumberOrTrue';
import { RowDataType, RowKeyType, ElementOffset } from '../@types/common';

interface TableDimensionProps {
  data?: RowDataType[];
  rowHeight?: number | ((rowData: RowDataType) => number);
  height: number;
  tableRef?: React.RefObject<HTMLDivElement>;
  headerWrapperRef?: React.RefObject<HTMLDivElement>;
  width?: number;
  prefix: (str: string) => string;
  affixHeader?: boolean | number;
  affixHorizontalScrollbar?: boolean | number;
  headerHeight: number;
  autoHeight?: boolean;
  children?: React.ReactNode;
  expandedRowKeys?: RowKeyType[];
  onTableScroll?: (coord: { x?: number; y?: number }) => void;
  onTableContentHeightChange?: (prevHeight: number) => void;
  onTableContentWidthChange?: (prevWidth: number) => void;
  onTableWidthChange?: (prevWidth: number) => void;
}

/**
 * The dimension information of the table,
 * including the height, width, scrollable distance and the coordinates of the scroll handle, etc.
 * @param props
 * @returns
 */
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
    onTableWidthChange,
    onTableContentWidthChange,
    onTableContentHeightChange,
    onTableScroll
  } = props;

  const contentHeight = useRef(0);
  const contentWidth = useRef(0);
  const minScrollY = useRef(0);
  const scrollY = useRef(0);
  const scrollX = useRef(0);
  const minScrollX = useRef(0);
  const tableWidth = useRef(widthProp || 0);
  const columnCount = useRef(0);
  const resizeObserver = useRef<ResizeObserver>();

  const headerOffset = useRef<ElementOffset | null>(null);
  const tableOffset = useRef<ElementOffset | null>(null);

  const calculateTableContextHeight = useCallback(() => {
    const prevContentHeight = contentHeight.current;
    const table = tableRef?.current;
    const rows = table?.querySelectorAll(`.${prefix?.('row')}`) || [];

    const nextContentHeight = rows.length
      ? (Array.from(rows).map((row: Element) => getHeight(row) || rowHeight) as number[]).reduce(
          (x: number, y: number) => x + y
        )
      : 0;

    // After setting the affixHeader property, the height of the two headers should be subtracted.
    contentHeight.current = Math.round(
      nextContentHeight - (affixHeader ? headerHeight * 2 : headerHeight)
    );

    if (!autoHeight) {
      /**
       *  The purpose of subtracting SCROLLBAR_WIDTH is to keep the scroll bar from blocking the content part.
       *  But it will only be calculated when there is a horizontal scroll bar (contentWidth > tableWidth).
       */
      minScrollY.current =
        -(nextContentHeight - height) -
        (contentWidth.current > tableWidth.current ? SCROLLBAR_WIDTH : 0);
    }

    // If the height of the content area is less than the height of the table, the vertical scroll bar is reset.
    if (nextContentHeight < height) {
      onTableScroll?.({ y: 0 });
    }

    // If the value of scrollTop is greater than the scrollable range, the vertical scroll bar is reset.
    // When Table is set to virtualized, the logic will be entered every time the wheel event is triggered
    // to avoid resetting the scroll bar after scrolling to the bottom, so add the SCROLLBAR_WIDTH value.
    if (Math.abs(scrollY.current) + height - headerHeight > nextContentHeight + SCROLLBAR_WIDTH) {
      onTableScroll?.({ y: scrollY.current });
    }

    if (prevContentHeight !== contentHeight.current) {
      onTableContentHeightChange?.(prevContentHeight);
    }
  }, [
    affixHeader,
    autoHeight,
    headerHeight,
    height,
    onTableScroll,
    onTableContentHeightChange,
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
    const prevWidth = contentWidth.current;
    const prevColumnCount = columnCount.current;
    const table = tableRef?.current;
    const row = table?.querySelector(`.${prefix('row')}:not(.virtualized)`);
    const nextContentWidth = row ? getWidth(row) : 0;

    contentWidth.current = nextContentWidth;
    columnCount.current = row?.querySelectorAll(`.${prefix('cell')}`).length || 0;

    // The value of SCROLLBAR_WIDTH is subtracted so that the scroll bar does not block the content part.
    // There is no vertical scroll bar after autoHeight.
    minScrollX.current =
      -(nextContentWidth - tableWidth.current) - (autoHeight ? 0 : SCROLLBAR_WIDTH);

    /**
     * If the width of the content area and the number of columns change,
     * the horizontal scroll bar is reset.
     * fix: https://github.com/rsuite/rsuite/issues/2039
     */
    if (
      prevWidth > 0 &&
      prevWidth !== contentWidth.current &&
      prevColumnCount > 0 &&
      prevColumnCount !== columnCount.current
    ) {
      onTableContentWidthChange?.(prevWidth);
    }
  }, [autoHeight, onTableContentWidthChange, prefix, tableRef]);

  const calculateTableWidth = useCallback(
    (nextWidth?: number) => {
      const prevWidth = tableWidth.current;

      if (tableRef?.current) {
        tableWidth.current = nextWidth || getWidth(tableRef?.current);
      }

      if (prevWidth && prevWidth !== tableWidth.current) {
        scrollX.current = 0;
        onTableWidthChange?.(prevWidth);
      }

      setOffsetByAffix();
    },
    [onTableWidthChange, setOffsetByAffix, tableRef]
  );

  useMount(() => {
    calculateTableContextHeight();
    calculateTableContentWidth();
    calculateTableWidth();
    setOffsetByAffix();

    resizeObserver.current = new ResizeObserver(entries => {
      for (const entry of entries) {
        calculateTableWidth(entry.contentRect.width);
      }
    });
    resizeObserver.current.observe(tableRef?.current as Element);
  });

  useUpdateLayoutEffect(() => {
    calculateTableWidth();
    calculateTableContextHeight();
    calculateTableContentWidth();
  }, [
    data,
    height,
    contentHeight,
    expandedRowKeys,
    children,
    calculateTableContextHeight,
    calculateTableContentWidth
  ]);

  useEffect(() => {
    return () => {
      resizeObserver.current?.disconnect();
    };
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
