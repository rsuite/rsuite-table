import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import isFunction from 'lodash/isFunction';
import flatten from 'lodash/flatten';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import eq from 'lodash/eq';
import omit from 'lodash/omit';
import merge from 'lodash/merge';
import bindElementResize, { unbind as unbindElementResize } from 'element-resize-event';
import { getTranslateDOMPositionXY } from 'dom-lib/lib/transition/translateDOMPositionXY';
import {
  addStyle,
  getWidth,
  getHeight,
  WheelHandler,
  scrollLeft,
  scrollTop,
  on,
  getOffset
} from 'dom-lib';

import Row from './Row';
import CellGroup from './CellGroup';
import Scrollbar from './Scrollbar';
import TableContext from './TableContext';
import { SCROLLBAR_WIDTH, CELL_PADDING_HEIGHT } from './constants';
import {
  getTotalByColumns,
  mergeCells,
  getUnhandledProps,
  defaultClassPrefix,
  toggleClass,
  flattenData,
  prefix,
  requestAnimationTimeout,
  cancelAnimationTimeout,
  isRTL,
  isNumberOrTrue,
  findRowKeys,
  findAllParents,
  shouldShowRowByExpanded,
  resetLeftForCells
} from './utils';

import { TableProps } from './Table.d';
import { RowProps } from './Row.d';
import { SortType } from './common.d';
import ColumnGroup from './ColumnGroup';

interface TableRowProps extends RowProps {
  key?: string | number;
  depth?: number;
}

const SORT_TYPE = {
  DESC: 'desc',
  ASC: 'asc'
};

type Offset = {
  top?: number;
  left?: number;
  width?: number;
  height?: number;
};

interface TableState {
  headerOffset?: Offset;
  tableOffset?: Offset;
  width: number;
  columnWidth: number;
  dataKey: number;
  shouldFixedColumn: boolean;
  contentHeight: number;
  contentWidth: number;
  tableRowsMaxHeight: number[];
  isColumnResizing?: boolean;
  expandedRowKeys: string[] | number[];
  sortType?: SortType;
  scrollY: number;
  isScrolling?: boolean;
  data: object[];
  cacheData: object[];
  fixedHeader: boolean;
  fixedHorizontalScrollbar?: boolean;
  isTree?: boolean;
  [key: string]: any;
}

class Table extends React.Component<TableProps, TableState> {
  static propTypes = {
    autoHeight: PropTypes.bool,
    affixHeader: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
    affixHorizontalScrollbar: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
    bordered: PropTypes.bool,
    bodyRef: PropTypes.func,
    className: PropTypes.string,
    classPrefix: PropTypes.string,
    children: PropTypes.any,
    cellBordered: PropTypes.bool,
    data: PropTypes.arrayOf(PropTypes.object),
    defaultExpandAllRows: PropTypes.bool,
    defaultExpandedRowKeys: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    ),
    defaultSortType: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
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
    rowExpandedHeight: PropTypes.number,
    renderEmpty: PropTypes.func,
    renderLoading: PropTypes.func,
    rowClassName: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    rtl: PropTypes.bool,
    style: PropTypes.object,
    sortColumn: PropTypes.string,
    sortType: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    showHeader: PropTypes.bool,
    shouldUpdateScroll: PropTypes.bool,
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
    onDataUpdated: PropTypes.func
  };
  static defaultProps = {
    classPrefix: defaultClassPrefix('table'),
    data: [],
    defaultSortType: SORT_TYPE.DESC,
    height: 200,
    rowHeight: 46,
    headerHeight: 40,
    minHeight: 0,
    rowExpandedHeight: 100,
    hover: true,
    showHeader: true,
    rowKey: 'key',
    translate3d: true,
    shouldUpdateScroll: true,
    locale: {
      emptyMessage: 'No data found',
      loading: 'Loading...'
    }
  };

  static getDerivedStateFromProps(props: TableProps, state: TableState) {
    if (props.data !== state.cacheData || props.isTree !== state.isTree) {
      return {
        cacheData: props.data,
        isTree: props.isTree,
        data: props.isTree ? flattenData(props.data) : props.data
      };
    }
    return null;
  }

  translateDOMPositionXY = null;
  scrollListener = null;

  tableRef: React.RefObject<any>;
  scrollbarYRef: React.RefObject<any>;
  scrollbarXRef: React.RefObject<any>;
  tableBodyRef: React.RefObject<any>;
  affixHeaderWrapperRef: React.RefObject<any>;
  mouseAreaRef: React.RefObject<any>;
  headerWrapperRef: React.RefObject<any>;
  tableHeaderRef: React.RefObject<any>;
  wheelWrapperRef: React.RefObject<any>;

  tableRows: { [key: string]: [HTMLElement, any] } = {};
  mounted = false;
  disableEventsTimeoutId = null;
  scrollY = 0;
  scrollX = 0;
  wheelHandler: any;
  minScrollY: any;
  minScrollX: any;
  mouseArea: any;
  touchX: any;
  touchY: any;
  wheelListener: any;
  touchStartListener: any;
  touchMoveListener: any;

  _cacheCells = null;
  _cacheChildrenSize = 0;
  _visibleRows = [];

  constructor(props: TableProps) {
    super(props);
    const {
      width,
      data,
      rowKey,
      defaultExpandAllRows,
      renderRowExpanded,
      defaultExpandedRowKeys,
      children = [],
      isTree,
      defaultSortType
    } = props;

    const expandedRowKeys = defaultExpandAllRows
      ? findRowKeys(data, rowKey, isFunction(renderRowExpanded))
      : defaultExpandedRowKeys || [];

    const shouldFixedColumn = Array.from(flatten(children as any) as Iterable<any>).some(
      (child: any) => child && child.props && child.props.fixed
    );

    if (isTree && !rowKey) {
      throw new Error('The `rowKey` is required when set isTree');
    }
    this.state = {
      isTree,
      expandedRowKeys,
      shouldFixedColumn,
      cacheData: data,
      data: isTree ? flattenData(data) : data,
      width: width || 0,
      columnWidth: 0,
      dataKey: 0,
      contentHeight: 0,
      contentWidth: 0,
      tableRowsMaxHeight: [],
      sortType: defaultSortType,
      scrollY: 0,
      isScrolling: false,
      fixedHeader: false
    };

    this.scrollY = 0;
    this.scrollX = 0;
    this.wheelHandler = new WheelHandler(
      this.listenWheel,
      this.shouldHandleWheelX,
      this.shouldHandleWheelY,
      false
    );

    this._cacheChildrenSize = flatten(children as any[]).length;

    this.translateDOMPositionXY = getTranslateDOMPositionXY({
      enable3DTransform: props.translate3d
    });
    this.tableRef = React.createRef();
    this.scrollbarYRef = React.createRef();
    this.scrollbarXRef = React.createRef();
    this.tableBodyRef = React.createRef();
    this.affixHeaderWrapperRef = React.createRef();
    this.mouseAreaRef = React.createRef();
    this.headerWrapperRef = React.createRef();
    this.wheelWrapperRef = React.createRef();
    this.tableHeaderRef = React.createRef();
  }

  listenWheel = (deltaX: number, deltaY: number) => {
    this.handleWheel(deltaX, deltaY);
    this.scrollbarXRef.current?.onWheelScroll?.(deltaX);
    this.scrollbarYRef.current?.onWheelScroll?.(deltaY);
  };

  componentDidMount() {
    this.calculateTableWidth();
    this.calculateTableContextHeight();
    this.calculateRowMaxHeight();
    this.setOffsetByAffix();
    this.initPosition();
    bindElementResize(this.tableRef.current, debounce(this.calculateTableWidth, 400));

    const options = { passive: false };
    const tableBody = this.tableBodyRef.current;
    if (tableBody) {
      this.wheelListener = on(tableBody, 'wheel', this.wheelHandler.onWheel, options);
      this.touchStartListener = on(tableBody, 'touchstart', this.handleTouchStart, options);
      this.touchMoveListener = on(tableBody, 'touchmove', this.handleTouchMove, options);
    }

    const { affixHeader, affixHorizontalScrollbar } = this.props;
    if (isNumberOrTrue(affixHeader) || isNumberOrTrue(affixHorizontalScrollbar)) {
      this.scrollListener = on(window, 'scroll', this.handleWindowScroll);
    }

    this.props?.bodyRef?.(this.wheelWrapperRef.current);
  }

  shouldComponentUpdate(nextProps: TableProps, nextState: TableState) {
    const _cacheChildrenSize = flatten((nextProps.children as any[]) || []).length;

    /**
     * 单元格列的信息在初始化后会被缓存，在某些属性被更新以后，需要清除缓存。
     */
    if (_cacheChildrenSize !== this._cacheChildrenSize) {
      this._cacheChildrenSize = _cacheChildrenSize;
      this._cacheCells = null;
    } else if (
      this.props.children !== nextProps.children ||
      this.props.sortColumn !== nextProps.sortColumn ||
      this.props.sortType !== nextProps.sortType
    ) {
      this._cacheCells = null;
    }

    return !eq(this.props, nextProps) || !isEqual(this.state, nextState);
  }

  componentDidUpdate(prevProps: TableProps, prevState: TableState) {
    const { rowHeight, data, height } = prevProps;

    if (data !== this.props.data) {
      this.calculateRowMaxHeight();
      this.props.onDataUpdated?.(this.props.data, this.scrollTo);

      const maxHeight =
        this.props.data.length * (typeof rowHeight === 'function' ? rowHeight(null) : rowHeight);
      // 当开启允许更新滚动条，或者滚动条位置大于表格的最大高度，则初始滚动条位置
      if (this.props.shouldUpdateScroll || Math.abs(this.scrollY) > maxHeight) {
        this.scrollTo({ x: 0, y: 0 });
      }
    } else {
      this.updatePosition();
    }

    if (
      // 当 Table 的 data 发生变化，需要重新计算高度
      data !== this.props.data ||
      // 当 Table 的 height 属性发生变化，需要重新计算 Table 高度
      height !== this.props.height ||
      // 当 Table 内容区的高度发生变化需要重新计算
      prevState.contentHeight !== this.state.contentHeight ||
      // 当 expandedRowKeys 发生变化，需要重新计算 Table 高度，如果重算会导致滚动条不显示。
      prevState.expandedRowKeys !== this.state.expandedRowKeys ||
      prevProps.expandedRowKeys !== this.props.expandedRowKeys
    ) {
      this.calculateTableContextHeight(prevProps);
    }

    this.calculateTableContentWidth(prevProps);
  }

  componentWillUnmount() {
    this.wheelHandler = null;
    if (this.tableRef.current) {
      unbindElementResize(this.tableRef.current);
    }
    this.wheelListener?.off();
    this.touchStartListener?.off();
    this.touchMoveListener?.off();
    this.scrollListener?.off();
  }
  getExpandedRowKeys() {
    const { expandedRowKeys } = this.props;
    return typeof expandedRowKeys === 'undefined' ? this.state.expandedRowKeys : expandedRowKeys;
  }

  getSortType() {
    const { sortType } = this.props;
    return typeof sortType === 'undefined' ? this.state.sortType : sortType;
  }

  getScrollCellGroups() {
    return this.tableRef.current?.querySelectorAll(`.${this.addPrefix('cell-group-scroll')}`);
  }

  getFixedLeftCellGroups() {
    return this.tableRef.current?.querySelectorAll(`.${this.addPrefix('cell-group-fixed-left')}`);
  }

  getFixedRightCellGroups() {
    return this.tableRef.current?.querySelectorAll(`.${this.addPrefix('cell-group-fixed-right')}`);
  }
  isRTL() {
    return this.props.rtl || isRTL();
  }

  getRowHeight(rowData = {}) {
    const { rowHeight } = this.props;
    return typeof rowHeight === 'function' ? rowHeight(rowData) : rowHeight;
  }

  /**
   * 获取表头高度
   */
  getTableHeaderHeight() {
    const { headerHeight, showHeader } = this.props;
    return showHeader ? headerHeight : 0;
  }

  /**
   * 获取 Table 需要渲染的高度
   */
  getTableHeight() {
    const { contentHeight } = this.state;
    const { minHeight, height, autoHeight, data } = this.props;
    const headerHeight = this.getTableHeaderHeight();

    if (data.length === 0 && autoHeight) {
      return height;
    }

    return autoHeight ? Math.max(headerHeight + contentHeight, minHeight) : height;
  }

  /**
   * 获取 columns ReactElement 数组
   * - 处理 children 中存在 <Column> 数组的情况
   * - 过滤 children 中的空项
   */
  getTableColumns(): React.ReactNodeArray {
    const { children } = this.props;

    if (!Array.isArray(children)) {
      return children as React.ReactNodeArray;
    }

    const flattenColumns = flatten(children).map((column: React.ReactElement) => {
      if (column?.type === ColumnGroup) {
        const { header, children: childColumns, align, fixed, verticalAlign } = column?.props;
        return childColumns.map((childColumn, index) => {
          // 把 ColumnGroup 设置的属性覆盖到 Column
          const groupCellProps: any = {
            align,
            fixed,
            verticalAlign
          };

          /**
           * 为分组中的第一列设置属性:
           * groupCount: 分组子项个数
           * groupHeader: 分组标题
           * resizable: 设置为不可自定义列宽
           */
          if (index === 0) {
            groupCellProps.groupCount = childColumns.length;
            groupCellProps.groupHeader = header;
            groupCellProps.resizable = false;
          }

          return React.cloneElement(childColumn, groupCellProps);
        });
      }
      return column;
    });

    // 把 Columns 中的数组，展平为一维数组，计算 lastColumn 与 firstColumn。
    return flatten(flattenColumns).filter(col => col);
  }

  getCellDescriptor() {
    if (this._cacheCells) {
      return this._cacheCells;
    }
    let hasCustomTreeCol = false;
    let left = 0; // Cell left margin
    const headerCells = []; // Table header cell
    const bodyCells = []; // Table body cell
    const children = this.props.children;

    if (!children) {
      this._cacheCells = {
        headerCells,
        bodyCells,
        hasCustomTreeCol,
        allColumnsWidth: left
      };
      return this._cacheCells;
    }

    const columns = this.getTableColumns();

    const { width: tableWidth } = this.state;
    const { sortColumn, rowHeight, showHeader } = this.props;
    const { totalFlexGrow, totalWidth } = getTotalByColumns(columns);
    const headerHeight = this.getTableHeaderHeight();

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

        let nextWidth =
          this.state[`${columnChildren[1].props.dataKey}_${index}_width`] || width || 0;

        if (tableWidth && flexGrow && totalFlexGrow) {
          nextWidth = Math.max(
            ((tableWidth - totalWidth) / totalFlexGrow) * flexGrow,
            minWidth || 60
          );
        }

        const cellProps = {
          ...omit(column.props, ['children']),
          'aria-colindex': index + 1,
          left,
          headerHeight,
          key: index,
          width: nextWidth,
          height: rowHeight,
          firstColumn: index === 0,
          lastColumn: index === columns.length - 1
        };

        if (showHeader && headerHeight) {
          const headerCellProps = {
            // index 用于拖拽列宽时候（Resizable column），定义的序号
            index,
            dataKey: columnChildren[1].props.dataKey,
            isHeaderCell: true,
            sortable: column.props.sortable,
            onSortColumn: this.handleSortColumn,
            sortType: this.getSortType(),
            sortColumn,
            flexGrow
          };

          if (resizable) {
            merge(headerCellProps, {
              onResize,
              onColumnResizeEnd: this.handleColumnResizeEnd,
              onColumnResizeStart: this.handleColumnResizeStart,
              onColumnResizeMove: this.handleColumnResizeMove
            });
          }

          headerCells.push(
            React.cloneElement(columnChildren[0], { ...cellProps, ...headerCellProps })
          );
        }

        bodyCells.push(React.cloneElement(columnChildren[1], cellProps));

        left += nextWidth;
      }
    });

    return (this._cacheCells = {
      headerCells,
      bodyCells,
      allColumnsWidth: left,
      hasCustomTreeCol
    });
  }

  setOffsetByAffix = () => {
    const { affixHeader, affixHorizontalScrollbar } = this.props;
    const headerNode = this.headerWrapperRef?.current;
    if (isNumberOrTrue(affixHeader) && headerNode) {
      this.setState(() => ({ headerOffset: getOffset(headerNode) }));
    }

    const tableNode = this.tableRef?.current;
    if (isNumberOrTrue(affixHorizontalScrollbar) && tableNode) {
      this.setState(() => ({ tableOffset: getOffset(tableNode) }));
    }
  };

  handleWindowScroll = () => {
    const { affixHeader, affixHorizontalScrollbar } = this.props;
    if (isNumberOrTrue(affixHeader)) {
      this.affixTableHeader();
    }
    if (isNumberOrTrue(affixHorizontalScrollbar)) {
      this.affixHorizontalScrollbar();
    }
  };

  affixHorizontalScrollbar = () => {
    const scrollY = window.scrollY || window.pageYOffset;
    const windowHeight = getHeight(window);
    const height = this.getTableHeight();

    const { tableOffset, fixedHorizontalScrollbar } = this.state;
    const { affixHorizontalScrollbar } = this.props;
    const headerHeight = this.getTableHeaderHeight();
    const bottom = typeof affixHorizontalScrollbar === 'number' ? affixHorizontalScrollbar : 0;

    const fixedScrollbar =
      scrollY + windowHeight < height + (tableOffset.top + bottom) &&
      scrollY + windowHeight - headerHeight > tableOffset.top + bottom;

    if (
      this.scrollbarXRef?.current?.barRef?.current &&
      fixedHorizontalScrollbar !== fixedScrollbar
    ) {
      this.setState({ fixedHorizontalScrollbar: fixedScrollbar });
    }
  };

  affixTableHeader = () => {
    const { affixHeader } = this.props;
    const top = typeof affixHeader === 'number' ? affixHeader : 0;
    const { headerOffset, contentHeight } = this.state;
    const scrollY = window.scrollY || window.pageYOffset;
    const fixedHeader =
      scrollY - (headerOffset.top - top) >= 0 && scrollY < headerOffset.top - top + contentHeight;

    if (this.affixHeaderWrapperRef.current) {
      toggleClass(this.affixHeaderWrapperRef.current, 'fixed', fixedHeader);
    }
  };

  handleSortColumn = (dataKey: string) => {
    let sortType = this.getSortType();

    if (this.props.sortColumn === dataKey) {
      sortType =
        sortType === SORT_TYPE.ASC ? (SORT_TYPE.DESC as SortType) : (SORT_TYPE.ASC as SortType);
      this.setState({ sortType });
    }
    this.props.onSortColumn?.(dataKey, sortType);
  };

  handleColumnResizeEnd = (
    columnWidth: number,
    _cursorDelta: number,
    dataKey: any,
    index: number
  ) => {
    this._cacheCells = null;
    this.setState({ isColumnResizing: false, [`${dataKey}_${index}_width`]: columnWidth });

    addStyle(this.mouseAreaRef.current, { display: 'none' });
  };

  handleColumnResizeStart = (width: number, left: number, fixed: boolean) => {
    this.setState({ isColumnResizing: true });
    this.handleColumnResizeMove(width, left, fixed);
  };

  handleColumnResizeMove = (width: number, left: number, fixed: boolean) => {
    let mouseAreaLeft = width + left;
    let x = mouseAreaLeft;
    let dir = 'left';

    if (this.isRTL()) {
      mouseAreaLeft += this.minScrollX + SCROLLBAR_WIDTH;
      dir = 'right';
    }

    if (!fixed) {
      x = mouseAreaLeft + (this.isRTL() ? -this.scrollX : this.scrollX);
    }

    addStyle(this.mouseAreaRef.current, { display: 'block', [dir]: `${x}px` });
  };

  handleTreeToggle = (rowKey: any, _rowIndex: number, rowData: any) => {
    const expandedRowKeys = this.getExpandedRowKeys();

    let open = false;
    const nextExpandedRowKeys = [];

    for (let i = 0; i < expandedRowKeys.length; i++) {
      const key = expandedRowKeys[i];
      if (key === rowKey) {
        open = true;
      } else {
        nextExpandedRowKeys.push(key);
      }
    }

    if (!open) {
      nextExpandedRowKeys.push(rowKey);
    }
    this.setState({ expandedRowKeys: nextExpandedRowKeys });
    this.props.onExpandChange?.(!open, rowData);
  };

  handleScrollX = (delta: number) => {
    this.handleWheel(delta, 0);
  };
  handleScrollY = (delta: number) => {
    this.handleWheel(0, delta);
  };

  handleWheel = (deltaX: number, deltaY: number) => {
    const { onScroll, virtualized } = this.props;
    const { contentWidth, width } = this.state;

    if (!this.tableRef.current) {
      return;
    }

    const nextScrollX = contentWidth <= width ? 0 : this.scrollX - deltaX;
    const nextScrollY = this.scrollY - deltaY;

    this.scrollY = Math.min(0, nextScrollY < this.minScrollY ? this.minScrollY : nextScrollY);
    this.scrollX = Math.min(0, nextScrollX < this.minScrollX ? this.minScrollX : nextScrollX);
    this.updatePosition();

    onScroll?.(this.scrollX, this.scrollY);

    if (virtualized) {
      this.setState({
        isScrolling: true,
        scrollY: this.scrollY
      });

      if (this.disableEventsTimeoutId) {
        cancelAnimationTimeout(this.disableEventsTimeoutId);
      }

      this.disableEventsTimeoutId = requestAnimationTimeout(this.debounceScrollEndedCallback, 150);
    }
  };

  debounceScrollEndedCallback = () => {
    this.disableEventsTimeoutId = null;
    this.setState({
      isScrolling: false
    });
  };

  // 处理移动端 Touch 事件,  Start 的时候初始化 x,y
  handleTouchStart = (event: React.TouchEvent) => {
    if (event.touches) {
      const { pageX, pageY } = event.touches[0];
      this.touchX = pageX;
      this.touchY = pageY;
    }

    this.props.onTouchStart?.(event);
  };

  // 处理移动端 Touch 事件, Move 的时候初始化，更新 scroll
  handleTouchMove = (event: React.TouchEvent) => {
    const { autoHeight } = this.props;

    if (event.touches) {
      const { pageX, pageY } = event.touches[0];
      const deltaX = this.touchX - pageX;
      const deltaY = autoHeight ? 0 : this.touchY - pageY;

      if (!this.shouldHandleWheelY(deltaY) && !this.shouldHandleWheelX(deltaX)) {
        return;
      }

      event.preventDefault?.();

      this.handleWheel(deltaX, deltaY);
      this.scrollbarXRef.current?.onWheelScroll?.(deltaX);
      this.scrollbarYRef.current?.onWheelScroll?.(deltaY);

      this.touchX = pageX;
      this.touchY = pageY;
    }

    this.props.onTouchMove?.(event);
  };

  /**
   * 当用户在 Table 内使用 tab 键，触发了 onScroll 事件，这个时候应该更新滚动条位置
   * https://github.com/rsuite/rsuite/issues/234
   */
  handleBodyScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (event.target !== this.tableBodyRef.current) {
      return;
    }

    const left = scrollLeft(event.target);
    const top = scrollTop(event.target);

    if (top === 0 && left === 0) {
      return;
    }

    this.listenWheel(left, top);

    scrollLeft(event.target, 0);
    scrollTop(event.target, 0);
  };

  initPosition() {
    if (this.isRTL()) {
      setTimeout(() => {
        const { contentWidth, width } = this.state;

        this.scrollX = width - contentWidth - SCROLLBAR_WIDTH;
        this.updatePosition();
        this.scrollbarXRef?.current?.resetScrollBarPosition?.(-this.scrollX);
      }, 0);
    }
  }

  updatePosition() {
    /**
     * 当存在锁定列情况处理
     */
    if (this.state.shouldFixedColumn) {
      this.updatePositionByFixedCell();
    } else {
      const wheelStyle = {};
      const headerStyle = {};

      this.translateDOMPositionXY(wheelStyle, this.scrollX, this.scrollY);
      this.translateDOMPositionXY(headerStyle, this.scrollX, 0);

      const wheelElement = this.wheelWrapperRef?.current;
      const headerElement = this.headerWrapperRef?.current;
      const affixHeaderElement = this.affixHeaderWrapperRef?.current;

      wheelElement && addStyle(wheelElement, wheelStyle);
      headerElement && addStyle(headerElement, headerStyle);

      if (affixHeaderElement?.hasChildNodes?.()) {
        addStyle(affixHeaderElement.firstChild, headerStyle);
      }
    }

    if (this.tableHeaderRef?.current) {
      toggleClass(
        this.tableHeaderRef.current,
        this.addPrefix('cell-group-shadow'),
        this.scrollY < 0
      );
    }
  }

  updatePositionByFixedCell() {
    const wheelGroupStyle = {};
    const wheelStyle = {};
    const scrollGroups = this.getScrollCellGroups();
    const fixedLeftGroups = this.getFixedLeftCellGroups();
    const fixedRightGroups = this.getFixedRightCellGroups();
    const { contentWidth, width } = this.state;

    this.translateDOMPositionXY(wheelGroupStyle, this.scrollX, 0);
    this.translateDOMPositionXY(wheelStyle, 0, this.scrollY);

    const scrollArrayGroups = Array.from(scrollGroups);

    for (let i = 0; i < scrollArrayGroups.length; i++) {
      const group = scrollArrayGroups[i];
      addStyle(group, wheelGroupStyle);
    }

    if (this.wheelWrapperRef?.current) {
      addStyle(this.wheelWrapperRef.current, wheelStyle);
    }

    const leftShadowClassName = this.addPrefix('cell-group-left-shadow');
    const rightShadowClassName = this.addPrefix('cell-group-right-shadow');
    const showLeftShadow = this.scrollX < 0;
    const showRightShadow = width - contentWidth - SCROLLBAR_WIDTH !== this.scrollX;

    toggleClass(fixedLeftGroups, leftShadowClassName, showLeftShadow);
    toggleClass(fixedRightGroups, rightShadowClassName, showRightShadow);
  }
  shouldHandleWheelX = (delta: number) => {
    const { disabledScroll, loading } = this.props;

    if (delta === 0 || disabledScroll || loading) {
      return false;
    }

    return true;
  };
  shouldHandleWheelY = (delta: number) => {
    const { disabledScroll, loading } = this.props;
    if (delta === 0 || disabledScroll || loading) {
      return false;
    }
    return (delta >= 0 && this.scrollY > this.minScrollY) || (delta < 0 && this.scrollY < 0);
  };

  shouldRenderExpandedRow(rowData: object) {
    const { rowKey, renderRowExpanded, isTree } = this.props;
    const expandedRowKeys = this.getExpandedRowKeys() || [];

    return (
      isFunction(renderRowExpanded) &&
      !isTree &&
      expandedRowKeys.some(key => key === rowData[rowKey])
    );
  }

  addPrefix = (name: string) => prefix(this.props.classPrefix)(name);

  calculateRowMaxHeight() {
    const { wordWrap } = this.props;
    if (wordWrap) {
      const tableRowsMaxHeight = [];
      const tableRows = Object.values(this.tableRows);

      for (let i = 0; i < tableRows.length; i++) {
        const [row] = tableRows[i];
        if (row) {
          const cells = row.querySelectorAll(`.${this.addPrefix('cell-wrap')}`) || [];
          const cellArray = Array.from(cells);
          let maxHeight = 0;

          for (let j = 0; j < cellArray.length; j++) {
            const cell = cellArray[j];
            const h = getHeight(cell);
            maxHeight = Math.max(maxHeight, h);
          }

          tableRowsMaxHeight.push(maxHeight);
        }
      }

      this.setState({ tableRowsMaxHeight });
    }
  }

  calculateTableWidth = () => {
    const table = this.tableRef?.current;
    const { width } = this.state;

    if (table) {
      const nextWidth = getWidth(table);
      if (width !== nextWidth) {
        this.scrollX = 0;
        this.scrollbarXRef?.current?.resetScrollBarPosition();
      }

      this._cacheCells = null;
      this.setState({ width: nextWidth });
    }
    this.setOffsetByAffix();
  };

  calculateTableContentWidth(prevProps: TableProps) {
    const table = this.tableRef?.current;
    const row = table.querySelector(`.${this.addPrefix('row')}:not(.virtualized)`);
    const contentWidth = row ? getWidth(row) : 0;

    this.setState({ contentWidth });
    // 这里 -SCROLLBAR_WIDTH 是为了让滚动条不挡住内容部分
    this.minScrollX = -(contentWidth - this.state.width) - SCROLLBAR_WIDTH;

    /**
     * 1.判断 Table 列数是否发生变化
     * 2.判断 Table 内容区域是否宽度有变化
     *
     * 满足 1 和 2 则更新横向滚动条位置
     */

    if (
      flatten(this.props.children as any[]).length !==
        flatten(prevProps.children as any[]).length &&
      this.state.contentWidth !== contentWidth
    ) {
      this.scrollLeft(0);
    }
  }

  calculateTableContextHeight(prevProps?: TableProps) {
    const table = this.tableRef.current;
    const rows = table.querySelectorAll(`.${this.addPrefix('row')}`) || [];
    const { height, autoHeight, rowHeight, affixHeader } = this.props;
    const headerHeight = this.getTableHeaderHeight();
    const contentHeight = rows.length
      ? Array.from(rows)
          .map(row => getHeight(row) || rowHeight)
          .reduce((x, y) => x + y)
      : 0;

    // 当设置 affixHeader 属性后要减掉两个 header 的高度
    const nextContentHeight = contentHeight - (affixHeader ? headerHeight * 2 : headerHeight);

    if (nextContentHeight !== this.state.contentHeight) {
      this.setState({ contentHeight: nextContentHeight });
    }

    if (
      prevProps &&
      // 当 data 更新，或者表格高度更新，则更新滚动条
      (prevProps.height !== height || prevProps.data !== this.props.data) &&
      this.scrollY !== 0
    ) {
      this.scrollTop(Math.abs(this.scrollY));
      this.updatePosition();
    }

    if (!autoHeight) {
      // 这里 -SCROLLBAR_WIDTH 是为了让滚动条不挡住内容部分
      this.minScrollY = -(contentHeight - height) - SCROLLBAR_WIDTH;
    }

    // 如果内容区域的高度小于表格的高度，则重置 Y 坐标滚动条
    if (contentHeight < height) {
      this.scrollTop(0);
    }

    // 如果 scrollTop 的值大于可以滚动的范围 ，则重置 Y 坐标滚动条
    // 当 Table 为 virtualized 时， wheel 事件触发每次都会进入该逻辑， 避免在滚动到底部后滚动条重置, +SCROLLBAR_WIDTH
    if (Math.abs(this.scrollY) + height - headerHeight > nextContentHeight + SCROLLBAR_WIDTH) {
      this.scrollTop(this.scrollY);
    }
  }

  getControlledScrollTopValue(value) {
    if (this.props.autoHeight) {
      return [0, 0];
    }
    const { contentHeight } = this.state;
    const headerHeight = this.getTableHeaderHeight();
    const height = this.getTableHeight();

    // 滚动值的最大范围判断
    value = Math.min(value, Math.max(0, contentHeight - (height - headerHeight)));

    // value 值是表格理论滚动位置的一个值，通过 value 计算出 scrollY 坐标值与滚动条位置的值
    return [-value, (value / contentHeight) * (height - headerHeight)];
  }

  getControlledScrollLeftValue(value) {
    const { contentWidth, width } = this.state;

    // 滚动值的最大范围判断
    value = Math.min(value, Math.max(0, contentWidth - width));

    return [-value, (value / contentWidth) * width];
  }

  /**
   * public method
   */
  scrollTop = (top = 0) => {
    const [scrollY, handleScrollY] = this.getControlledScrollTopValue(top);

    this.scrollY = scrollY;
    this.scrollbarYRef?.current?.resetScrollBarPosition?.(handleScrollY);
    this.updatePosition();

    /**
     * 当开启 virtualized，调用 scrollTop 后会出现白屏现象，
     * 原因是直接操作 DOM 的坐标，但是组件没有重新渲染，需要调用 forceUpdate 重新进入 render。
     * Fix: rsuite#1044
     */
    if (this.props.virtualized && this.state.contentHeight > this.props.height) {
      this.forceUpdate();
    }
  };

  // public method
  scrollLeft = (left = 0) => {
    const [scrollX, handleScrollX] = this.getControlledScrollLeftValue(left);
    this.scrollX = scrollX;
    this.scrollbarXRef?.current?.resetScrollBarPosition?.(handleScrollX);
    this.updatePosition();
  };

  scrollTo = (coord: { x: number; y: number }) => {
    const { x, y } = coord || {};
    if (typeof x === 'number') {
      this.scrollLeft(x);
    }
    if (typeof y === 'number') {
      this.scrollTop(y);
    }
  };

  bindTableRowsRef = (index: number | string, rowData: any) => (ref: HTMLElement) => {
    if (ref) {
      this.tableRows[index] = [ref, rowData];
    }
  };

  bindRowClick = (rowData: object) => {
    return (event: React.MouseEvent) => {
      this.props.onRowClick?.(rowData, event);
    };
  };

  bindRowContextMenu = (rowData: object) => {
    return (event: React.MouseEvent) => {
      this.props.onRowContextMenu?.(rowData, event);
    };
  };

  renderRowData(
    bodyCells: any[],
    rowData: any,
    props: TableRowProps,
    shouldRenderExpandedRow?: boolean
  ) {
    const { renderTreeToggle, rowKey, wordWrap, isTree } = this.props;
    const hasChildren = isTree && rowData.children && Array.isArray(rowData.children);
    const nextRowKey = typeof rowData[rowKey] !== 'undefined' ? rowData[rowKey] : props.key;

    const rowProps: TableRowProps = {
      ...props,
      key: nextRowKey,
      'aria-rowindex': (props.key as number) + 2,
      rowRef: this.bindTableRowsRef(props.key, rowData),
      onClick: this.bindRowClick(rowData),
      onContextMenu: this.bindRowContextMenu(rowData)
    };

    const expandedRowKeys = this.getExpandedRowKeys() || [];
    const expanded = expandedRowKeys.some(key => key === rowData[rowKey]);
    const cells = [];

    for (let i = 0; i < bodyCells.length; i++) {
      const cell = bodyCells[i];
      cells.push(
        React.cloneElement(cell, {
          hasChildren,
          rowData,
          wordWrap,
          renderTreeToggle,
          height: props.height,
          rowIndex: props.key,
          depth: props.depth,
          onTreeToggle: this.handleTreeToggle,
          rowKey: nextRowKey,
          expanded
        })
      );
    }

    return this.renderRow(rowProps, cells, shouldRenderExpandedRow, rowData);
  }

  renderRow(props: TableRowProps, cells: any[], shouldRenderExpandedRow?: boolean, rowData?: any) {
    const { rowClassName } = this.props;
    const { shouldFixedColumn, width, contentWidth } = this.state;
    const { depth, ...restRowProps } = props;
    if (typeof rowClassName === 'function') {
      restRowProps.className = rowClassName(rowData);
    } else {
      restRowProps.className = rowClassName;
    }

    const rowStyles: React.CSSProperties = {};
    let rowRight = 0;

    if (this.isRTL() && contentWidth > width) {
      rowRight = width - contentWidth;
      rowStyles.right = rowRight;
    }

    // IF there are fixed columns, add a fixed group
    if (shouldFixedColumn && contentWidth > width) {
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

        if (this.isRTL()) {
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

      return (
        <Row {...restRowProps} data-depth={depth} style={rowStyles}>
          {fixedLeftCellGroupWidth ? (
            <CellGroup
              fixed="left"
              height={props.isHeaderRow ? props.headerHeight : props.height}
              width={fixedLeftCellGroupWidth}
              style={this.isRTL() ? { right: width - fixedLeftCellGroupWidth - rowRight } : null}
            >
              {mergeCells(resetLeftForCells(fixedLeftCells))}
            </CellGroup>
          ) : null}

          <CellGroup>{mergeCells(scrollCells)}</CellGroup>

          {fixedRightCellGroupWidth ? (
            <CellGroup
              fixed="right"
              style={
                this.isRTL()
                  ? { right: 0 - rowRight }
                  : { left: width - fixedRightCellGroupWidth - SCROLLBAR_WIDTH }
              }
              height={props.isHeaderRow ? props.headerHeight : props.height}
              width={fixedRightCellGroupWidth + SCROLLBAR_WIDTH}
            >
              {mergeCells(resetLeftForCells(fixedRightCells, SCROLLBAR_WIDTH))}
            </CellGroup>
          ) : null}

          {shouldRenderExpandedRow && this.renderRowExpanded(rowData)}
        </Row>
      );
    }

    return (
      <Row {...restRowProps} data-depth={depth} style={rowStyles}>
        <CellGroup>{mergeCells(cells)}</CellGroup>
        {shouldRenderExpandedRow && this.renderRowExpanded(rowData)}
      </Row>
    );
  }

  renderRowExpanded(rowData?: object) {
    const { renderRowExpanded, rowExpandedHeight } = this.props;
    const styles = { height: rowExpandedHeight };

    if (typeof renderRowExpanded === 'function') {
      return (
        <div className={this.addPrefix('row-expanded')} style={styles}>
          {renderRowExpanded(rowData)}
        </div>
      );
    }
    return null;
  }

  renderMouseArea() {
    const headerHeight = this.getTableHeaderHeight();
    const styles = { height: this.getTableHeight() };
    const spanStyles = { height: headerHeight - 1 };

    return (
      <div ref={this.mouseAreaRef} className={this.addPrefix('mouse-area')} style={styles}>
        <span style={spanStyles} />
      </div>
    );
  }

  renderTableHeader(headerCells: any[], rowWidth: number) {
    const { affixHeader } = this.props;
    const { width: tableWidth } = this.state;
    const top = typeof affixHeader === 'number' ? affixHeader : 0;
    const headerHeight = this.getTableHeaderHeight();
    const rowProps: TableRowProps = {
      'aria-rowindex': 1,
      rowRef: this.tableHeaderRef,
      width: rowWidth,
      height: this.getRowHeight(),
      headerHeight,
      isHeaderRow: true,
      top: 0
    };

    const fixedStyle: React.CSSProperties = {
      position: 'fixed',
      overflow: 'hidden',
      height: this.getTableHeaderHeight(),
      width: tableWidth,
      top
    };

    // Affix header
    const header = (
      <div
        className={classNames(this.addPrefix('affix-header'))}
        style={fixedStyle}
        ref={this.affixHeaderWrapperRef}
      >
        {this.renderRow(rowProps, headerCells)}
      </div>
    );

    return (
      <React.Fragment>
        {(affixHeader === 0 || affixHeader) && header}
        <div
          role="rowgroup"
          className={this.addPrefix('header-row-wrapper')}
          ref={this.headerWrapperRef}
        >
          {this.renderRow(rowProps, headerCells)}
        </div>
      </React.Fragment>
    );
  }

  renderTableBody(bodyCells: any[], rowWidth: number) {
    const {
      rowExpandedHeight,
      renderRowExpanded,
      isTree,
      rowKey,
      wordWrap,
      virtualized,
      rowHeight
    } = this.props;

    const headerHeight = this.getTableHeaderHeight();
    const { tableRowsMaxHeight, isScrolling, data } = this.state;
    const height = this.getTableHeight();
    const bodyHeight = height - headerHeight;
    const bodyStyles = {
      top: headerHeight,
      height: bodyHeight
    };

    let contentHeight = 0;
    let topHideHeight = 0;
    let bottomHideHeight = 0;

    this._visibleRows = [];

    if (data) {
      let top = 0; // Row position
      const minTop = Math.abs(this.scrollY);
      const maxTop = minTop + height + rowExpandedHeight;
      const isCustomRowHeight = typeof rowHeight === 'function';
      const isUncertainHeight = !!(renderRowExpanded || isCustomRowHeight || isTree);

      /**
      如果开启了 virtualized  同时 Table 中的的行高是可变的，
      则需要循环遍历 data, 获取每一行的高度。
      */
      if ((isUncertainHeight && virtualized) || !virtualized) {
        for (let index = 0; index < data.length; index++) {
          const rowData = data[index];
          const maxHeight = tableRowsMaxHeight[index];
          const shouldRenderExpandedRow = this.shouldRenderExpandedRow(rowData);

          let nextRowHeight = 0;
          let depth = 0;

          if (typeof rowHeight === 'function') {
            nextRowHeight = rowHeight(rowData);
          } else {
            nextRowHeight = maxHeight
              ? Math.max(maxHeight + CELL_PADDING_HEIGHT, rowHeight)
              : rowHeight;
            if (shouldRenderExpandedRow) {
              nextRowHeight += rowExpandedHeight;
            }
          }

          if (isTree) {
            const parents = findAllParents(rowData, rowKey);
            const expandedRowKeys = this.getExpandedRowKeys();
            depth = parents.length;

            //  如果是 Tree Table,  判断当前的行是否展开/折叠，如果是折叠则不显示该行。
            if (!shouldShowRowByExpanded(expandedRowKeys, parents)) {
              continue;
            }
          }

          contentHeight += nextRowHeight;

          const rowProps = {
            key: index,
            top,
            width: rowWidth,
            depth,
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

          this._visibleRows.push(
            this.renderRowData(bodyCells, rowData, rowProps, shouldRenderExpandedRow)
          );
        }
      } else {
        /**
        如果 Table 的行高是固定的，则直接通过行高与行数进行计算，
        减少遍历所有 data 带来的性能消耗
        */
        const nextRowHeight = this.getRowHeight();
        const startIndex = Math.max(Math.floor(minTop / nextRowHeight), 0);
        const endIndex = Math.min(startIndex + Math.ceil(bodyHeight / nextRowHeight), data.length);

        contentHeight = data.length * nextRowHeight;
        topHideHeight = startIndex * nextRowHeight;
        bottomHideHeight = (data.length - endIndex) * nextRowHeight;

        for (let index = startIndex; index < endIndex; index++) {
          const rowData = data[index];
          const rowProps = {
            key: index,
            top: index * nextRowHeight,
            width: rowWidth,
            height: nextRowHeight
          };
          this._visibleRows.push(this.renderRowData(bodyCells, rowData, rowProps, false));
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
        ref={this.tableBodyRef}
        role="rowgroup"
        className={this.addPrefix('body-row-wrapper')}
        style={bodyStyles}
        onScroll={this.handleBodyScroll}
      >
        <div
          style={wheelStyles}
          className={this.addPrefix('body-wheel-area')}
          ref={this.wheelWrapperRef}
        >
          {topHideHeight ? <Row style={topRowStyles} className="virtualized" /> : null}
          {this._visibleRows}
          {bottomHideHeight ? <Row style={bottomRowStyles} className="virtualized" /> : null}
        </div>

        {this.renderInfo()}
        {this.renderScrollbar()}
        {this.renderLoading()}
      </div>
    );
  }

  renderInfo() {
    const { locale, renderEmpty, loading } = this.props;
    if (this._visibleRows.length || loading) {
      return null;
    }
    const emptyMessage = <div className={this.addPrefix('body-info')}>{locale.emptyMessage}</div>;

    return renderEmpty ? renderEmpty(emptyMessage) : emptyMessage;
  }

  renderScrollbar() {
    const { disabledScroll, affixHorizontalScrollbar, id } = this.props;
    const { contentWidth, contentHeight, width, fixedHorizontalScrollbar } = this.state;
    const bottom = typeof affixHorizontalScrollbar === 'number' ? affixHorizontalScrollbar : 0;

    const headerHeight = this.getTableHeaderHeight();
    const height = this.getTableHeight();

    if (disabledScroll) {
      return null;
    }

    return (
      <div>
        <Scrollbar
          tableId={id}
          className={classNames({ fixed: fixedHorizontalScrollbar })}
          style={{ width, bottom: fixedHorizontalScrollbar ? bottom : undefined }}
          length={this.state.width}
          onScroll={this.handleScrollX}
          scrollLength={contentWidth}
          ref={this.scrollbarXRef}
        />
        <Scrollbar
          vertical
          tableId={id}
          length={height - headerHeight}
          scrollLength={contentHeight}
          onScroll={this.handleScrollY}
          ref={this.scrollbarYRef}
        />
      </div>
    );
  }

  /**
   *  show loading
   */
  renderLoading() {
    const { locale, loading, loadAnimation, renderLoading } = this.props;

    if (!loadAnimation && !loading) {
      return null;
    }

    const loadingElement = (
      <div className={this.addPrefix('loader-wrapper')}>
        <div className={this.addPrefix('loader')}>
          <i className={this.addPrefix('loader-icon')} />
          <span className={this.addPrefix('loader-text')}>{locale.loading}</span>
        </div>
      </div>
    );

    return renderLoading ? renderLoading(loadingElement) : loadingElement;
  }

  render() {
    const {
      children,
      className,
      data,
      width = 0,
      style,
      isTree,
      hover,
      bordered,
      cellBordered,
      wordWrap,
      classPrefix,
      loading,
      showHeader,
      ...rest
    } = this.props;

    const { isColumnResizing } = this.state;
    const { headerCells, bodyCells, allColumnsWidth, hasCustomTreeCol } = this.getCellDescriptor();
    const rowWidth = allColumnsWidth > width ? allColumnsWidth : width;
    const clesses = classNames(classPrefix, className, {
      [this.addPrefix('word-wrap')]: wordWrap,
      [this.addPrefix('treetable')]: isTree,
      [this.addPrefix('bordered')]: bordered,
      [this.addPrefix('cell-bordered')]: cellBordered,
      [this.addPrefix('column-resizing')]: isColumnResizing,
      [this.addPrefix('hover')]: hover,
      [this.addPrefix('loading')]: loading
    });

    const styles = {
      width: width || 'auto',
      height: this.getTableHeight(),
      ...style
    };

    const unhandled = getUnhandledProps(Table, rest);

    return (
      <TableContext.Provider
        value={{
          translateDOMPositionXY: this.translateDOMPositionXY,
          rtl: this.isRTL(),
          isTree,
          hasCustomTreeCol
        }}
      >
        <div
          role={isTree ? 'treegrid' : 'grid'}
          // The aria-rowcount is specified on the element with the table.
          // Its value is an integer equal to the total number of rows available, including header rows.
          aria-rowcount={data.length + 1}
          aria-colcount={this._cacheChildrenSize}
          {...unhandled}
          className={clesses}
          style={styles}
          ref={this.tableRef}
        >
          {showHeader && this.renderTableHeader(headerCells, rowWidth)}
          {children && this.renderTableBody(bodyCells, rowWidth)}
          {showHeader && this.renderMouseArea()}
        </div>
      </TableContext.Provider>
    );
  }
}

export default Table;
