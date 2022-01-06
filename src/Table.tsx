import React, { useState, useRef, useCallback, useImperativeHandle, useReducer } from 'react';
import { getTranslateDOMPositionXY } from 'dom-lib/translateDOMPositionXY';
import PropTypes from 'prop-types';
import isFunction from 'lodash/isFunction';
import flatten from 'lodash/flatten';
import Row, { RowProps } from './Row';
import CellGroup from './CellGroup';
import Scrollbar, { ScrollbarInstance } from './Scrollbar';
import MouseArea from './MouseArea';
import Loader from './Loader';
import EmptyMessage from './EmptyMessage';
import TableContext from './TableContext';
import {
  SCROLLBAR_WIDTH,
  CELL_PADDING_HEIGHT,
  SORT_TYPE,
  EXPANDED_KEY,
  TREE_DEPTH
} from './constants';
import {
  mergeCells,
  flattenData,
  isRTL,
  findRowKeys,
  findAllParents,
  shouldShowRowByExpanded,
  resetLeftForCells,
  useClassNames,
  useControlled,
  useUpdateEffect,
  useCellDescriptor,
  useTableDimension,
  useTableRows,
  useAffix,
  useScrollListener,
  usePosition,
  isSupportTouchEvent
} from './utils';

import type {
  StandardProps,
  SortType,
  RowDataType,
  RowKeyType,
  TableLocaleType
} from './@types/common';

/**
 * Filter those expanded nodes.
 * @param data
 * @param expandedRowKeys
 * @param rowKey
 * @returns
 */
const filterTreeData = (data: any[], expandedRowKeys: RowKeyType[], rowKey: RowKeyType) => {
  return flattenData(data).filter(rowData => {
    const parents = findAllParents(rowData, rowKey);
    const expanded = shouldShowRowByExpanded(expandedRowKeys, parents);

    rowData[EXPANDED_KEY] = expanded;
    rowData[TREE_DEPTH] = parents.length;

    return expanded;
  });
};

export interface TableProps extends Omit<StandardProps, 'onScroll'> {
  /** Automatic Height */
  autoHeight?: boolean;

  /** Affix the table header to the specified position on the page */
  affixHeader?: boolean | number;

  /** Affix the table horizontal scrollbar to the specified position on the page */
  affixHorizontalScrollbar?: boolean | number;

  /** Show the border of the table */
  bordered?: boolean;

  /** Display the borders of table cells */
  cellBordered?: boolean;

  /** Default sort type */
  defaultSortType?: SortType;

  /** Disable scroll bar */
  disabledScroll?: boolean;

  /** Expand all nodes By default */
  defaultExpandAllRows?: boolean;

  /** Specify the default expanded row by  rowkey */
  defaultExpandedRowKeys?: RowKeyType[];

  /** Table data */
  data: RowDataType[];

  /** Specify the default expanded row by  rowkey (Controlled) */
  expandedRowKeys?: RowKeyType[];

  /** The visible height of the table (the height of the scrollable container). */
  height?: number;

  /** The minimum height of the table. The height is maintained even when the content is not stretched. */
  minHeight?: number;

  /** The row of the table has a mouseover effect */
  hover?: boolean;

  /** The height of the table header */
  headerHeight?: number;

  /** The component localized character set. */
  locale?: TableLocaleType;

  /** Show loading */
  loading?: boolean;

  /** Whether to enable loading animation */
  loadAnimation?: boolean;

  /** The row height of the table */
  rowHeight?: number | ((rowData: RowDataType) => number);

  /** Each row corresponds to the unique key in  data */
  rowKey?: RowKeyType;

  /** The table will be displayed as a tree structure */
  isTree?: boolean;

  /** Set the height of an expandable area */
  rowExpandedHeight?: number;

  /** Add an optional extra class name to row */
  rowClassName?: string | ((rowData: RowDataType) => string);

  /** Whether to display the header of the table */
  showHeader?: boolean;

  /** Sort Column Name */
  sortColumn?: string;

  /** Sort type */
  sortType?: SortType;

  /**
   * Use the return value of `shouldUpdateScroll` to determine
   * whether to update the scroll after the table size is updated.
   */
  shouldUpdateScroll?:
    | boolean
    | ((event: 'bodyHeightChanged' | 'bodyWidthChanged' | 'widthChanged') => {
        x?: number;
        y?: number;
      });

  /** Enable 3D transition rendering to improve performance when scrolling. */
  translate3d?: boolean;

  /** Right to left */
  rtl?: boolean;

  /** The width of the table. When it is not set, it will adapt according to the container */
  width?: number;

  /** The cell wraps automatically */
  wordWrap?: boolean;

  /** Effectively render large tabular data */
  virtualized?: boolean;

  /** Tree table, the callback function in the expanded node */
  renderTreeToggle?: (
    expandButton: React.ReactNode,
    rowData?: RowDataType,
    expanded?: boolean
  ) => React.ReactNode;

  /** Customize what you can do to expand a zone */
  renderRowExpanded?: (rowData?: RowDataType) => React.ReactNode;

  /** Custom row element */
  renderRow?: (children?: React.ReactNode, rowData?: RowDataType) => React.ReactNode;

  /** Customized data is empty display content */
  renderEmpty?: (info: React.ReactNode) => React.ReactNode;

  /** Customize the display content in the data load */
  renderLoading?: (loading: React.ReactNode) => React.ReactNode;

  /** Click the callback function after the row and return to rowDate */
  onRowClick?: (rowData: RowDataType, event: React.MouseEvent) => void;

  /** Callback after right-click row */
  onRowContextMenu?: (rowData: RowDataType, event: React.MouseEvent) => void;

  /** Callback function for scroll bar scrolling */
  onScroll?: (scrollX: number, scrollY: number) => void;

  /** Click the callback function of the sort sequence to return the value sortColumn, sortType */
  onSortColumn?: (dataKey: string, sortType?: SortType) => void;

  /** Tree table, the callback function in the expanded node */
  onExpandChange?: (expanded: boolean, rowData: RowDataType) => void;

  /** Callback for the `touchstart` event. */
  onTouchStart?: (event: React.TouchEvent) => void;

  /** Callback for the `touchmove` event. */
  onTouchMove?: (event: React.TouchEvent) => void;

  /** Callback for the `touchend` event. */
  onTouchEnd?: (event: React.TouchEvent) => void;

  /**
   * Callback after table data update.
   * @deprecated use `shouldUpdateScroll` instead
   **/
  onDataUpdated?: (
    nextData: RowDataType[],
    scrollTo: (coord: { x: number; y: number }) => void
  ) => void;

  /**
   * A ref attached to the table body element
   * @deprecated use `ref` instead (see `ref.current.body`)
   **/
  bodyRef?: (ref: HTMLElement) => void;
}

interface TableRowProps extends RowProps {
  key?: string | number;
  depth?: number;
}

const Table = React.forwardRef((props: TableProps, ref) => {
  const {
    affixHeader,
    children,
    classPrefix,
    className,
    data: dataProp,
    width: widthProp,
    expandedRowKeys: expandedRowKeysProp,
    defaultExpandAllRows,
    defaultExpandedRowKeys,
    style,
    id,
    isTree,
    hover,
    bordered,
    cellBordered,
    wordWrap,
    loading,
    locale,
    showHeader,
    sortColumn,
    rowHeight: rowHeightProp,
    sortType: sortTypeProp,
    defaultSortType,
    headerHeight: headerHeightProp,
    minHeight,
    height,
    autoHeight,
    rtl: rtlProp,
    translate3d,
    rowKey,
    virtualized,
    rowHeight,
    rowClassName,
    rowExpandedHeight,
    disabledScroll,
    affixHorizontalScrollbar,
    loadAnimation,
    shouldUpdateScroll,
    renderRow: renderRowProp,
    renderRowExpanded: renderRowExpandedProp,
    renderLoading,
    renderEmpty,
    onSortColumn,
    onScroll,
    renderTreeToggle,
    onRowClick,
    onRowContextMenu,
    onExpandChange,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    ...rest
  } = props;

  if (isTree && !rowKey) {
    throw new Error('The `rowKey` is required when set isTree');
  }

  const {
    withClassPrefix,
    merge: mergeCls,
    prefix
  } = useClassNames(classPrefix || 'table', typeof classPrefix !== 'undefined');

  // Use `forceUpdate` to force the component to re-render after manipulating the DOM.
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  const [expandedRowKeys, setExpandedRowKeys] = useControlled(
    expandedRowKeysProp,
    defaultExpandAllRows
      ? findRowKeys(dataProp, rowKey, isFunction(renderRowExpandedProp))
      : defaultExpandedRowKeys || []
  );

  const [data, setData] = useState(() => {
    return isTree ? filterTreeData(dataProp, expandedRowKeys, rowKey) : dataProp;
  });

  const { tableRowsMaxHeight, bindTableRowsRef } = useTableRows({
    data: dataProp,
    expandedRowKeys,
    wordWrap,
    prefix
  });

  const headerHeight = showHeader ? headerHeightProp : 0;
  const rtl = rtlProp || isRTL();

  const getRowHeight = (rowData = {}) => {
    return typeof rowHeightProp === 'function' ? rowHeightProp(rowData) : rowHeightProp;
  };

  const translateDOMPositionXY = useRef(
    getTranslateDOMPositionXY({ enable3DTransform: translate3d })
  );

  const shouldFixedColumn = Array.from(flatten(children as any) as Iterable<any>).some(
    child => child?.props?.fixed
  );

  const visibleRows = useRef([]);
  const mouseAreaRef = useRef<HTMLDivElement>();
  const tableRef = useRef<HTMLDivElement>();
  const tableHeaderRef = useRef<HTMLDivElement>();
  const affixHeaderWrapperRef = useRef<HTMLDivElement>();
  const headerWrapperRef = useRef<HTMLDivElement>();
  const tableBodyRef = useRef<HTMLDivElement>();
  const wheelWrapperRef = useRef<HTMLDivElement>();
  const scrollbarXRef = useRef<ScrollbarInstance>();
  const scrollbarYRef = useRef<ScrollbarInstance>();

  /**
   * Reset the position of the scroll bar after the table size changes.
   */
  const resetScrollbar = (event: 'bodyHeightChanged' | 'bodyWidthChanged' | 'widthChanged') => {
    forceUpdate();

    if (typeof shouldUpdateScroll === 'function') {
      onScrollTo(shouldUpdateScroll(event));
    } else if (shouldUpdateScroll) {
      const vertical = event === 'bodyHeightChanged';
      vertical ? onScrollTop(0) : onScrollLeft(0);
    }
  };

  const {
    contentHeight,
    contentWidth,
    minScrollY,
    minScrollX,
    scrollY,
    scrollX,
    tableWidth,
    tableOffset,
    headerOffset,
    setScrollY,
    setScrollX
  } = useTableDimension({
    data: dataProp,
    width: widthProp,
    rowHeight,
    tableRef,
    headerWrapperRef,
    prefix,
    affixHeader,
    affixHorizontalScrollbar,
    headerHeight,
    height,
    autoHeight,
    children,
    expandedRowKeys,
    onTableScroll: (coords: { x: number; y: number }) => {
      onScrollTo(coords);
    },
    onTableContentHeightChange: () => {
      resetScrollbar('bodyHeightChanged');
    },
    onTableContentWidthChange: () => {
      resetScrollbar('bodyWidthChanged');
    },
    onTableWidthChange: () => {
      resetScrollbar('widthChanged');
    }
  });

  const getTableHeight = useCallback(() => {
    if (data.length === 0 && autoHeight) {
      return height;
    }

    return autoHeight ? Math.max(headerHeight + contentHeight.current, minHeight) : height;
  }, [autoHeight, contentHeight, data.length, headerHeight, height, minHeight]);

  useAffix({
    tableHeight: getTableHeight,
    contentHeight,
    affixHorizontalScrollbar,
    affixHeader,
    tableOffset,
    headerOffset,
    headerHeight,
    scrollbarXRef,
    affixHeaderWrapperRef
  });

  const { forceUpdatePosition } = usePosition({
    data: dataProp,
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
  });

  const {
    isScrolling,
    onScrollHorizontal,
    onScrollVertical,
    onScrollBody,
    onScrollTop,
    onScrollLeft,
    onScrollTo
  } = useScrollListener({
    rtl,
    data: dataProp,
    height,
    virtualized,
    getTableHeight,
    contentHeight,
    headerHeight,
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
    forceUpdatePosition,
    onScroll,
    onTouchStart,
    onTouchMove,
    onTouchEnd
  });

  const { headerCells, bodyCells, allColumnsWidth, hasCustomTreeCol } = useCellDescriptor({
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
    prefix,
    onSortColumn,
    rowHeight
  });

  const colCounts = useRef(headerCells?.length || 0);

  useUpdateEffect(() => {
    setData(isTree ? filterTreeData(dataProp, expandedRowKeys, rowKey) : dataProp);
  }, [dataProp, expandedRowKeys, rowKey, isTree]);

  useUpdateEffect(() => {
    if (headerCells?.length !== colCounts.current) {
      onScrollLeft(0);
      colCounts.current = headerCells?.length || 0;
    }
  }, [children]);

  useImperativeHandle(ref, () => ({
    get root() {
      return tableRef.current;
    },
    get body() {
      return wheelWrapperRef.current;
    },
    scrollTop: onScrollTop,
    scrollLeft: onScrollLeft
  }));

  const rowWidth = allColumnsWidth > tableWidth.current ? allColumnsWidth : tableWidth.current;

  const classes = mergeCls(
    className,
    withClassPrefix({
      bordered,
      hover,
      loading,
      treetable: isTree,
      'word-wrap': wordWrap,
      'cell-bordered': cellBordered
    })
  );

  const styles = {
    width: widthProp || 'auto',
    height: getTableHeight(),
    ...style
  };

  const renderRowExpanded = useCallback(
    (rowData?: RowDataType) => {
      const styles = { height: rowExpandedHeight };

      if (typeof renderRowExpandedProp === 'function') {
        return (
          <div className={prefix('row-expanded')} style={styles}>
            {renderRowExpandedProp(rowData)}
          </div>
        );
      }
      return null;
    },
    [prefix, renderRowExpandedProp, rowExpandedHeight]
  );

  const renderRow = (
    props: TableRowProps,
    cells: any[],
    shouldRenderExpandedRow?: boolean,
    rowData?: any
  ) => {
    const { depth, ...restRowProps } = props;

    if (typeof rowClassName === 'function') {
      restRowProps.className = rowClassName(rowData);
    } else {
      restRowProps.className = rowClassName;
    }

    const rowStyles: React.CSSProperties = {
      ...props?.style
    };
    let rowRight = 0;

    if (rtl && contentWidth.current > tableWidth.current) {
      rowRight = tableWidth.current - contentWidth.current;
      rowStyles.right = rowRight;
    }

    let rowNode = null;

    // IF there are fixed columns, add a fixed group
    if (shouldFixedColumn && contentWidth.current > tableWidth.current) {
      const fixedLeftCells = [];
      const fixedRightCells = [];
      const scrollCells = [];
      let fixedLeftCellGroupWidth = 0;
      let fixedRightCellGroupWidth = 0;

      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        const { fixed, width } = cell.props;

        let isFixedStart = fixed === 'left' || fixed === true;
        let isFixedEnd = fixed === 'right';

        if (rtl) {
          isFixedStart = fixed === 'right';
          isFixedEnd = fixed === 'left' || fixed === true;
        }

        if (isFixedStart) {
          fixedLeftCells.push(cell);
          fixedLeftCellGroupWidth += width;
        } else if (isFixedEnd) {
          fixedRightCells.push(cell);
          fixedRightCellGroupWidth += width;
        } else {
          scrollCells.push(cell);
        }
      }

      rowNode = (
        <>
          {fixedLeftCellGroupWidth ? (
            <CellGroup
              fixed="left"
              height={props.isHeaderRow ? props.headerHeight : props.height}
              width={fixedLeftCellGroupWidth}
              style={
                rtl ? { right: tableWidth.current - fixedLeftCellGroupWidth - rowRight } : null
              }
            >
              {mergeCells(resetLeftForCells(fixedLeftCells))}
            </CellGroup>
          ) : null}

          <CellGroup>{mergeCells(scrollCells)}</CellGroup>

          {fixedRightCellGroupWidth ? (
            <CellGroup
              fixed="right"
              style={
                rtl
                  ? { right: 0 - rowRight }
                  : { left: tableWidth.current - fixedRightCellGroupWidth - SCROLLBAR_WIDTH }
              }
              height={props.isHeaderRow ? props.headerHeight : props.height}
              width={fixedRightCellGroupWidth + SCROLLBAR_WIDTH}
            >
              {mergeCells(resetLeftForCells(fixedRightCells, SCROLLBAR_WIDTH))}
            </CellGroup>
          ) : null}

          {shouldRenderExpandedRow && renderRowExpanded(rowData)}
        </>
      );
    } else {
      rowNode = (
        <>
          <CellGroup>{mergeCells(cells)}</CellGroup>
          {shouldRenderExpandedRow && renderRowExpanded(rowData)}
        </>
      );
    }

    return (
      <Row {...restRowProps} data-depth={depth} style={rowStyles}>
        {renderRowProp ? renderRowProp(rowNode, rowData) : rowNode}
      </Row>
    );
  };

  const renderTableHeader = (headerCells: any[], rowWidth: number) => {
    const top = typeof affixHeader === 'number' ? affixHeader : 0;
    const rowProps: TableRowProps = {
      'aria-rowindex': 1,
      rowRef: tableHeaderRef,
      width: rowWidth,
      height: getRowHeight(),
      headerHeight,
      isHeaderRow: true,
      top: 0
    };

    const fixedStyle: React.CSSProperties = {
      position: 'fixed',
      overflow: 'hidden',
      height: headerHeight,
      width: tableWidth.current,
      top
    };

    // Affix header
    const header = (
      <div className={prefix('affix-header')} style={fixedStyle} ref={affixHeaderWrapperRef}>
        {renderRow(rowProps, headerCells)}
      </div>
    );

    return (
      <React.Fragment>
        {(affixHeader === 0 || affixHeader) && header}
        <div role="rowgroup" className={prefix('header-row-wrapper')} ref={headerWrapperRef}>
          {renderRow(rowProps, headerCells)}
        </div>
      </React.Fragment>
    );
  };

  const shouldRenderExpandedRow = useCallback(
    (rowData: RowDataType) => {
      return (
        isFunction(renderRowExpandedProp) &&
        !isTree &&
        expandedRowKeys.some(key => key === rowData[rowKey])
      );
    },
    [expandedRowKeys, isTree, renderRowExpandedProp, rowKey]
  );

  const bindRowClick = useCallback(
    (rowData: RowDataType) => {
      return (event: React.MouseEvent) => {
        onRowClick?.(rowData, event);
      };
    },
    [onRowClick]
  );

  const bindRowContextMenu = useCallback(
    (rowData: RowDataType) => {
      return (event: React.MouseEvent) => {
        onRowContextMenu?.(rowData, event);
      };
    },
    [onRowContextMenu]
  );

  const handleTreeToggle = useCallback(
    (treeRowKey: any, _rowIndex: number, rowData: RowDataType) => {
      let open = false;
      const nextExpandedRowKeys = [];

      for (let i = 0; i < expandedRowKeys.length; i++) {
        const key = expandedRowKeys[i];
        if (key === treeRowKey) {
          open = true;
        } else {
          nextExpandedRowKeys.push(key);
        }
      }

      if (!open) {
        nextExpandedRowKeys.push(treeRowKey);
      }

      setExpandedRowKeys(nextExpandedRowKeys);
      onExpandChange?.(!open, rowData);
    },
    [expandedRowKeys, onExpandChange, setExpandedRowKeys]
  );

  const renderRowData = (
    bodyCells: any[],
    rowData: any,
    props: TableRowProps,
    shouldRenderExpandedRow?: boolean
  ) => {
    const hasChildren = isTree && rowData.children && Array.isArray(rowData.children);
    const nextRowKey = typeof rowData[rowKey] !== 'undefined' ? rowData[rowKey] : props.key;

    const rowProps: TableRowProps = {
      ...props,
      key: nextRowKey,
      'aria-rowindex': (props.key as number) + 2,
      rowRef: bindTableRowsRef(props.key as any, rowData),
      onClick: bindRowClick(rowData),
      onContextMenu: bindRowContextMenu(rowData)
    };

    const expanded = expandedRowKeys.some(key => key === rowData[rowKey]);
    const cells = [];

    for (let i = 0; i < bodyCells.length; i++) {
      const cell = bodyCells[i];
      const rowSpan: number = cell.props?.rowSpan?.(rowData);
      const rowHeight = rowSpan ? rowSpan * props.height : props.height;

      if (rowSpan) {
        rowProps.rowSpan = rowSpan;
        rowProps.style = {
          /**
           * In the case of multiple-column merged rows,
           * the `zIndex` value of the previous row should be greater than the `zIndex` value of the following row.
           * So `rowSpan` is used as the `zIndex` value.
           */
          zIndex: rowProps.style?.zIndex || rowSpan,
          overflow: 'inherit'
        };

        // TODO: Do not render those cells merged by `rowSpan`
      }

      cells.push(
        React.cloneElement(cell, {
          hasChildren,
          rowData,
          wordWrap,
          height: rowHeight,
          rowIndex: props.key,
          depth: props.depth,
          renderTreeToggle,
          onTreeToggle: handleTreeToggle,
          rowKey: nextRowKey,
          expanded,
          rowSpan
        })
      );
    }

    return renderRow(rowProps, cells, shouldRenderExpandedRow, rowData);
  };

  const renderScrollbar = () => {
    const height = getTableHeight();

    if (disabledScroll) {
      return null;
    }

    return [
      <Scrollbar
        key="scrollbar"
        tableId={id}
        style={{ width: tableWidth.current }}
        length={tableWidth.current}
        onScroll={onScrollHorizontal}
        scrollLength={contentWidth.current}
        ref={scrollbarXRef}
      />,
      <Scrollbar
        key="vertical-scrollbar"
        vertical
        tableId={id}
        length={height - headerHeight}
        scrollLength={contentHeight.current}
        onScroll={onScrollVertical}
        ref={scrollbarYRef}
      />
    ];
  };

  const renderTableBody = (bodyCells: any[], rowWidth: number) => {
    const height = getTableHeight();
    const bodyHeight = height - headerHeight;
    const bodyStyles = {
      top: headerHeight,
      height: bodyHeight
    };

    let contentHeight = 0;
    let topHideHeight = 0;
    let bottomHideHeight = 0;

    visibleRows.current = [];

    if (data) {
      let top = 0; // Row position
      let minTop = Math.abs(scrollY.current);
      let maxTop = minTop + height + rowExpandedHeight;
      const isCustomRowHeight = typeof rowHeight === 'function';
      const isUncertainHeight = !!renderRowExpandedProp || isCustomRowHeight || wordWrap;

      // If virtualized is enabled and the row height in the Table is variable,
      // you need to loop through the data to get the height of each row.
      if ((isUncertainHeight && virtualized) || !virtualized) {
        // Avoid white screens on the top and bottom of the table when touching and scrolling on the mobile terminal.
        // So supplement the display data row.
        if (isSupportTouchEvent()) {
          const coveredHeight = height * 3;
          minTop = Math.max(minTop - coveredHeight, 0);
          maxTop = maxTop + coveredHeight;
        }

        for (let index = 0; index < data.length; index++) {
          const rowData = data[index];
          const maxHeight = tableRowsMaxHeight[index];
          const shouldRender = shouldRenderExpandedRow(rowData);

          let nextRowHeight = 0;

          if (typeof rowHeight === 'function') {
            nextRowHeight = rowHeight(rowData);
          } else {
            nextRowHeight = maxHeight
              ? Math.max(maxHeight + CELL_PADDING_HEIGHT, rowHeight)
              : rowHeight;
            if (shouldRender) {
              nextRowHeight += rowExpandedHeight;
            }
          }

          contentHeight += nextRowHeight;

          const rowProps = {
            key: index,
            top,
            width: rowWidth,
            depth: rowData[TREE_DEPTH],
            height: nextRowHeight
          };

          top += nextRowHeight;

          if (virtualized && !wordWrap) {
            if (top + nextRowHeight < minTop) {
              topHideHeight += nextRowHeight;
              continue;
            } else if (top > maxTop) {
              bottomHideHeight += nextRowHeight;
              continue;
            }
          }

          visibleRows.current.push(renderRowData(bodyCells, rowData, rowProps, shouldRender));
        }
      } else {
        /** virtualized */

        // If the row height of the Table is fixed, it is directly calculated by the row height and the number of rows,
        // thereby reducing the performance cost of traversing all data.
        const nextRowHeight = getRowHeight();
        let startIndex = Math.max(Math.floor(minTop / nextRowHeight), 0);
        let endIndex = Math.min(
          startIndex + Math.ceil(bodyHeight / nextRowHeight) + 5,
          data.length
        );

        // Avoid white screens on the top and bottom of the table when touching and scrolling on the mobile terminal.
        // So supplement the display data row.
        if (isSupportTouchEvent()) {
          const coveredCount = Math.floor((height / nextRowHeight) * 3);
          startIndex = Math.max(startIndex - coveredCount, 0);
          endIndex = Math.min(endIndex + coveredCount, data.length);
        }

        contentHeight = data.length * nextRowHeight;
        topHideHeight = startIndex * nextRowHeight;
        bottomHideHeight = (data.length - endIndex) * nextRowHeight;

        for (let index = startIndex; index < endIndex; index++) {
          const rowData = data[index];
          const rowProps = {
            key: index,
            depth: rowData[TREE_DEPTH],
            top: index * nextRowHeight,
            width: rowWidth,
            height: nextRowHeight
          };
          visibleRows.current.push(renderRowData(bodyCells, rowData, rowProps, false));
        }
      }
    }

    const wheelStyles: React.CSSProperties = {
      position: 'absolute',
      height: contentHeight,
      minHeight: height,
      pointerEvents: isScrolling ? 'none' : undefined
    };
    const topRowStyles = { height: topHideHeight };
    const bottomRowStyles = { height: bottomHideHeight };

    return (
      <div
        ref={tableBodyRef}
        role="rowgroup"
        className={prefix('body-row-wrapper')}
        style={bodyStyles}
        onScroll={onScrollBody}
      >
        <div style={wheelStyles} className={prefix('body-wheel-area')} ref={wheelWrapperRef}>
          {topHideHeight ? <Row style={topRowStyles} className="virtualized" /> : null}
          {visibleRows.current}
          {bottomHideHeight ? <Row style={bottomRowStyles} className="virtualized" /> : null}
        </div>

        <EmptyMessage
          locale={locale}
          renderEmpty={renderEmpty}
          addPrefix={prefix}
          loading={!!visibleRows.current?.length || loading}
        />
        {renderScrollbar()}
        <Loader
          locale={locale}
          loadAnimation={loadAnimation}
          loading={loading}
          addPrefix={prefix}
          renderLoading={renderLoading}
        />
      </div>
    );
  };

  const contextValue = React.useMemo(
    () => ({
      classPrefix: withClassPrefix(),
      translateDOMPositionXY: translateDOMPositionXY.current,
      rtl,
      isTree,
      hasCustomTreeCol
    }),
    [hasCustomTreeCol, isTree, rtl, withClassPrefix]
  );

  return (
    <TableContext.Provider value={contextValue}>
      <div
        role={isTree ? 'treegrid' : 'grid'}
        // The aria-rowcount is specified on the element with the table.
        // Its value is an integer equal to the total number of rows available, including header rows.
        aria-rowcount={data.length + 1}
        aria-colcount={colCounts.current}
        aria-busy={loading}
        {...rest}
        className={classes}
        style={styles}
        ref={tableRef}
      >
        {showHeader && renderTableHeader(headerCells, rowWidth)}
        {children && renderTableBody(bodyCells, rowWidth)}
        {showHeader && (
          <MouseArea
            ref={mouseAreaRef}
            addPrefix={prefix}
            headerHeight={headerHeight}
            height={getTableHeight()}
          />
        )}
      </div>
    </TableContext.Provider>
  );
});

Table.displayName = 'Table';
Table.defaultProps = {
  data: [],
  defaultSortType: SORT_TYPE.DESC as SortType,
  height: 200,
  rowHeight: 46,
  headerHeight: 40,
  minHeight: 0,
  rowExpandedHeight: 100,
  hover: true,
  showHeader: true,
  translate3d: true,
  shouldUpdateScroll: true,
  locale: {
    emptyMessage: 'No data found',
    loading: 'Loading...'
  }
};

Table.propTypes = {
  autoHeight: PropTypes.bool,
  affixHeader: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  affixHorizontalScrollbar: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  bordered: PropTypes.bool,
  className: PropTypes.string,
  classPrefix: PropTypes.string,
  children: PropTypes.any,
  cellBordered: PropTypes.bool,
  data: PropTypes.arrayOf(PropTypes.object),
  defaultExpandAllRows: PropTypes.bool,
  defaultExpandedRowKeys: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ),
  defaultSortType: PropTypes.any,
  disabledScroll: PropTypes.bool,
  expandedRowKeys: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  hover: PropTypes.bool,
  height: PropTypes.number,
  headerHeight: PropTypes.number,
  locale: PropTypes.object,
  loading: PropTypes.bool,
  loadAnimation: PropTypes.bool,
  minHeight: PropTypes.number,
  rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  rowHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
  renderTreeToggle: PropTypes.func,
  renderRowExpanded: PropTypes.func,
  renderRow: PropTypes.func,
  rowExpandedHeight: PropTypes.number,
  renderEmpty: PropTypes.func,
  renderLoading: PropTypes.func,
  rowClassName: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  rtl: PropTypes.bool,
  style: PropTypes.object,
  sortColumn: PropTypes.string,
  sortType: PropTypes.any,
  showHeader: PropTypes.bool,
  shouldUpdateScroll: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  translate3d: PropTypes.bool,
  wordWrap: PropTypes.bool,
  width: PropTypes.number,
  virtualized: PropTypes.bool,
  isTree: PropTypes.bool,
  onRowClick: PropTypes.func,
  onRowContextMenu: PropTypes.func,
  onScroll: PropTypes.func,
  onSortColumn: PropTypes.func,
  onExpandChange: PropTypes.func,
  onTouchStart: PropTypes.func,
  onTouchMove: PropTypes.func,
  onTouchEnd: PropTypes.func
};

export default Table;
