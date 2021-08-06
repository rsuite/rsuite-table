import React, { useState, useCallback, useRef } from 'react';
import { addStyle, addClass, removeClass } from 'dom-lib';
import omit from 'lodash/omit';
import merge from 'lodash/merge';

import { SCROLLBAR_WIDTH, SORT_TYPE } from '../constants';
import { SortType, RowDataType } from '../@types/common';
import useControlled from './useControlled';
import getTableColumns from './getTableColumns';
import getTotalByColumns from './getTotalByColumns';
import useUpdateEffect from './useUpdateEffect';

interface CellDescriptorProps {
  children: React.ReactNode;
  rtl: boolean;
  minScrollX: React.RefObject<number>;
  scrollX: React.RefObject<number>;
  tableWidth: React.RefObject<number>;
  headerHeight: number;
  showHeader: boolean;
  sortType: SortType;
  defaultSortType: SortType;
  sortColumn: string;
  prefix?: (str: string) => string;
  onSortColumn: (dataKey: string, sortType?: SortType) => void;
  rowHeight: number | ((rowData?: RowDataType) => number);
  mouseAreaRef: React.RefObject<HTMLDivElement>;
  tableRef: React.RefObject<HTMLDivElement>;
}

interface CellDescriptor {
  headerCells: any[];
  bodyCells: any[];
  hasCustomTreeCol: boolean;
  allColumnsWidth: number;
}

//

/**
 * Attach rendering-related attributes to all cells of the form and cache them.
 * @param props
 * @returns
 */
const useCellDescriptor = (props: CellDescriptorProps): CellDescriptor => {
  const {
    children,
    rtl,
    mouseAreaRef,
    tableRef,
    minScrollX,
    scrollX,
    tableWidth,
    headerHeight,
    showHeader,
    sortType: sortTypeProp,
    defaultSortType,
    sortColumn,
    rowHeight,
    onSortColumn,
    prefix
  } = props;

  const [sortType, setSortType] = useControlled(sortTypeProp, defaultSortType);
  const [cacheData, setCacheData] = useState<CellDescriptor>();

  const clearCache = useCallback(() => {
    setCacheData(null);
  }, []);

  const setColumnResizing = useCallback(
    (resizing: boolean) => {
      if (resizing) {
        addClass(tableRef.current, prefix('column-resizing'));
      } else {
        removeClass(tableRef.current, prefix('column-resizing'));
      }
    },
    [prefix, tableRef]
  );

  const columnWidths = useRef({});

  useUpdateEffect(() => {
    clearCache();
  }, [children, sortColumn, sortType, tableWidth.current, scrollX.current, minScrollX.current]);

  const handleColumnResizeEnd = useCallback(
    (columnWidth: number, _cursorDelta: number, dataKey: any, index: number) => {
      columnWidths.current[`${dataKey}_${index}_width`] = columnWidth;

      setColumnResizing(false);
      addStyle(mouseAreaRef.current, { display: 'none' });
      clearCache();
    },
    [clearCache, mouseAreaRef, setColumnResizing]
  );

  const handleColumnResizeMove = useCallback(
    (width: number, left: number, fixed: boolean) => {
      let mouseAreaLeft = width + left;
      let x = mouseAreaLeft;
      let dir = 'left';

      if (rtl) {
        mouseAreaLeft += minScrollX.current + SCROLLBAR_WIDTH;
        dir = 'right';
      }

      if (!fixed) {
        x = mouseAreaLeft + (rtl ? -scrollX.current : scrollX.current);
      }

      addStyle(mouseAreaRef.current, { display: 'block', [dir]: `${x}px` });
    },
    [minScrollX, mouseAreaRef, rtl, scrollX]
  );

  const handleColumnResizeStart = useCallback(
    (width: number, left: number, fixed: boolean) => {
      setColumnResizing(true);
      handleColumnResizeMove(width, left, fixed);
    },
    [handleColumnResizeMove, setColumnResizing]
  );

  const handleSortColumn = useCallback(
    (dataKey: string) => {
      let nextSortType = sortType;
      if (sortColumn === dataKey) {
        nextSortType =
          sortType === SORT_TYPE.ASC ? (SORT_TYPE.DESC as SortType) : (SORT_TYPE.ASC as SortType);

        setSortType(nextSortType);
      }
      onSortColumn?.(dataKey, nextSortType);
    },
    [onSortColumn, setSortType, sortColumn, sortType]
  );

  if (cacheData) {
    return cacheData;
  }

  let hasCustomTreeCol = false;
  let left = 0; // Cell left margin
  const headerCells = []; // Table header cell
  const bodyCells = []; // Table body cell

  if (!children) {
    const cacheCell = {
      headerCells,
      bodyCells,
      hasCustomTreeCol,
      allColumnsWidth: left
    };
    setCacheData(cacheCell);

    return cacheCell;
  }

  const columns = getTableColumns(children) as React.ReactNodeArray;

  const { totalFlexGrow, totalWidth } = getTotalByColumns(columns);

  React.Children.forEach(columns, (column, index) => {
    if (React.isValidElement(column)) {
      const columnChildren = column.props.children;
      const { width, resizable, flexGrow, minWidth, onResize, treeCol } = column.props;

      if (treeCol) {
        hasCustomTreeCol = true;
      }

      if (resizable && flexGrow) {
        console.warn(
          `Cannot set 'resizable' and 'flexGrow' together in <Column>, column index: ${index}`
        );
      }

      if (columnChildren.length !== 2) {
        throw new Error(`Component <HeaderCell> and <Cell> is required, column index: ${index} `);
      }

      let cellWidth =
        columnWidths.current?.[`${columnChildren[1].props.dataKey}_${index}_width`] || width || 0;

      if (tableWidth.current && flexGrow && totalFlexGrow) {
        cellWidth = Math.max(
          ((tableWidth.current - totalWidth) / totalFlexGrow) * flexGrow,
          minWidth || 60
        );
      }

      const cellProps = {
        ...omit(column.props, ['children']),
        'aria-colindex': index + 1,
        left,
        headerHeight,
        key: index,
        width: cellWidth,
        height: typeof rowHeight === 'function' ? rowHeight() : rowHeight,
        firstColumn: index === 0,
        lastColumn: index === columns.length - 1
      };

      if (showHeader && headerHeight) {
        const headerCellProps = {
          // index 用于拖拽列宽时候（Resizable column），定义的序号
          index,
          dataKey: columnChildren[1].props.dataKey,
          isHeaderCell: true,
          minWidth: column.props.minWidth,
          sortable: column.props.sortable,
          onSortColumn: handleSortColumn,
          sortType,
          sortColumn,
          flexGrow
        };

        if (resizable) {
          merge(headerCellProps, {
            onResize,
            onColumnResizeEnd: handleColumnResizeEnd,
            onColumnResizeStart: handleColumnResizeStart,
            onColumnResizeMove: handleColumnResizeMove
          });
        }

        headerCells.push(
          React.cloneElement(columnChildren[0], { ...cellProps, ...headerCellProps })
        );
      }

      bodyCells.push(React.cloneElement(columnChildren[1], cellProps));

      left += cellWidth;
    }
  });

  const cacheCell = {
    headerCells,
    bodyCells,
    allColumnsWidth: left,
    hasCustomTreeCol
  };

  setCacheData(cacheCell);

  return cacheCell;
};

export default useCellDescriptor;
