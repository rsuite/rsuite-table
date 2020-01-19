// @flow

import * as React from 'react';
import classNames from 'classnames';
import _ from 'lodash';
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
import { SCROLLBAR_WIDTH, CELL_PADDING_HEIGHT } from './constants';
import {
  getTotalByColumns,
  colSpanCells,
  getUnhandledProps,
  defaultClassPrefix,
  toggleClass,
  flattenData,
  prefix,
  requestAnimationTimeout,
  cancelAnimationTimeout,
  isRTL,
  findRowKeys,
  findAllParents,
  shouldShowRowByExpanded,
  resetLeftForCells
} from './utils';

const columnHandledProps = [
  'align',
  'verticalAlign',
  'width',
  'fixed',
  'resizable',
  'flexGrow',
  'minWidth',
  'colSpan'
];

const SORT_TYPE = {
  DESC: 'desc',
  ASC: 'asc'
};

type SortType = 'desc' | 'asc';
type Props = {
  width?: number,
  data: Array<Object>,
  height: number,
  autoHeight?: boolean,
  minHeight: number,
  rowHeight: number,
  headerHeight: number,
  setRowHeight?: (rowData: Object) => number,
  rowKey: string | number,
  isTree?: boolean,
  defaultExpandAllRows?: boolean,
  defaultExpandedRowKeys?: Array<string | number>,
  expandedRowKeys?: Array<string | number>,
  renderTreeToggle?: (expandButton: React.Node, rowData: Object) => React.Node,
  renderRowExpanded?: (rowDate?: Object) => React.Node,
  rowExpandedHeight?: number,
  locale: Object,
  style?: Object,
  sortColumn?: string,
  sortType?: SortType,
  defaultSortType?: SortType,
  disabledScroll?: boolean,
  hover: boolean,
  loading?: boolean,
  className?: string,
  classPrefix?: string,
  children: React.ChildrenArray<*>,
  bordered?: boolean,
  cellBordered?: boolean,
  wordWrap?: boolean,
  onRowClick?: (rowData: Object, event: SyntheticEvent<any>) => void,
  onScroll?: (scrollX: number, scrollY: number) => void,
  onSortColumn?: (dataKey: string, sortType?: SortType) => void,
  onExpandChange?: (expanded: boolean, rowData: Object) => void,
  onTouchStart?: (event: SyntheticTouchEvent<*>) => void, // for tests
  onTouchMove?: (event: SyntheticTouchEvent<*>) => void, // for tests
  bodyRef?: React.ElementRef<*>,
  loadAnimation?: boolean,
  showHeader?: boolean,
  rowClassName?: string | ((rowData: ?Object) => string),
  virtualized?: boolean,
  renderEmpty?: (info: React.Node) => React.Node,
  renderLoading?: (loading: React.Node) => React.Node,
  translate3d?: boolean,
  affixHeader?: boolean | number
};

type Offset = {
  top?: number,
  left?: number,
  width?: number,
  height?: number
};

type State = {
  width: number,
  columnWidth: number,
  dataKey: number,
  shouldFixedColumn: boolean,
  contentHeight: number,
  contentWidth: number,
  tableRowsMaxHeight: Array<number>,
  isColumnResizing?: boolean,
  expandedRowKeys: Array<string | number>,
  sortType?: SortType,
  scrollY: number,
  isScrolling?: boolean,
  data: Array<Object>,
  cacheData: Array<Object>,
  fixedHeader: boolean,
  affixHeaderOffset: Offset
};

class Table extends React.Component<Props, State> {
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
    virtualized: false,
    rowKey: 'key',
    translate3d: true,
    locale: {
      emptyMessage: 'No data found',
      loading: 'Loading...'
    }
  };

  static getDerivedStateFromProps(props: Props, state: State) {
    if (props.data !== state.cacheData) {
      return {
        cacheData: props.data,
        data: props.isTree ? flattenData(props.data) : props.data
      };
    }
    return null;
  }

  constructor(props: Props) {
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
      ? findRowKeys(data, rowKey, _.isFunction(renderRowExpanded))
      : defaultExpandedRowKeys || [];

    const shouldFixedColumn = Array.from(children).some(
      (child: any) => child && child.props && child.props.fixed
    );

    if (isTree && !rowKey) {
      throw new Error('The `rowKey` is required when set isTree');
    }
    this.state = {
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
      this._listenWheel,
      this.shouldHandleWheelX,
      this.shouldHandleWheelY,
      false
    );

    this._cacheChildrenSize = _.flatten(children).length;

    this.translateDOMPositionXY = getTranslateDOMPositionXY({
      enable3DTransform: props.translate3d
    });
  }

  _listenWheel = (deltaX: number, deltaY: number) => {
    this.handleWheel(deltaX, deltaY);
    if (this.scrollbarX) {
      this.scrollbarX.onWheelScroll(deltaX);
    }

    if (this.scrollbarY) {
      this.scrollbarY.onWheelScroll(deltaY);
    }
  };

  componentDidMount() {
    this.calculateTableWidth();
    this.calculateTableContextHeight();
    this.calculateRowMaxHeight();
    this.setAffixHeaderOffset();
    this.initPosition();
    bindElementResize(this.table, _.debounce(this.calculateTableWidth, 400));

    const options = { passive: false };

    this.wheelListener = on(this.tableBody, 'wheel', this.wheelHandler.onWheel, options);
    this.touchStartListener = on(this.tableBody, 'touchstart', this.handleTouchStart, options);
    this.touchMoveListener = on(this.tableBody, 'touchmove', this.handleTouchMove, options);

    const { affixHeader } = this.props;
    if (affixHeader === 0 || affixHeader) {
      this.scrollListener = on(window, 'scroll', this.updateAffixHeaderStatus);
    }
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    const _cacheChildrenSize = _.flatten(nextProps.children || []).length;
    if (_cacheChildrenSize !== this._cacheChildrenSize) {
      this._cacheChildrenSize = _cacheChildrenSize;
      this._cacheCells = null;
    }

    if (
      this.props.children !== nextProps.children ||
      this.props.sortColumn !== nextProps.sortColumn ||
      this.props.sortType !== nextProps.sortType
    ) {
      this._cacheCells = null;
    }

    return !_.eq(this.props, nextProps) || !_.isEqual(this.state, nextState);
  }

  componentDidUpdate(prevProps: Props) {
    this.calculateTableContextHeight(prevProps);
    this.calculateTableContentWidth(prevProps);
    this.calculateRowMaxHeight();
    this.updatePosition();
  }

  componentWillUnmount() {
    this.wheelHandler = null;
    if (this.table) {
      unbindElementResize(this.table);
    }
    if (this.wheelListener) {
      this.wheelListener.off();
    }

    if (this.touchStartListener) {
      this.touchStartListener.off();
    }

    if (this.touchMoveListener) {
      this.touchMoveListener.off();
    }

    if (this.scrollListener) {
      this.scrollListener.off();
    }
  }
  getExpandedRowKeys() {
    const { expandedRowKeys } = this.props;
    return _.isUndefined(expandedRowKeys) ? this.state.expandedRowKeys : expandedRowKeys;
  }

  getSortType() {
    const { sortType } = this.props;
    return _.isUndefined(sortType) ? this.state.sortType : sortType;
  }

  getScrollCellGroups() {
    return this.table.querySelectorAll(`.${this.addPrefix('cell-group-scroll')}`);
  }

  getFixedLeftCellGroups() {
    return this.table.querySelectorAll(`.${this.addPrefix('cell-group-fixed-left')}`);
  }

  getFixedRightCellGroups() {
    return this.table.querySelectorAll(`.${this.addPrefix('cell-group-fixed-right')}`);
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

  setAffixHeaderOffset = () => {
    const { affixHeader } = this.props;
    if (affixHeader === 0 || affixHeader) {
      this.setState(() => {
        return { affixHeaderOffset: getOffset(this.headerWrapper) };
      });
    }
  };

  updateAffixHeaderStatus = () => {
    const { affixHeader } = this.props;
    const top = typeof affixHeader === 'number' ? affixHeader : 0;
    const { affixHeaderOffset, contentHeight } = this.state;
    const scrollY = window.scrollY || window.pageYOffset;
    const fixedHeader =
      scrollY - (affixHeaderOffset.top - top) >= 0 &&
      scrollY < affixHeaderOffset.top - top + contentHeight;

    if (this.affixHeaderWrapper) {
      toggleClass(this.affixHeaderWrapper, 'fixed', fixedHeader);
    }
  };

  handleSortColumn = (dataKey: string) => {
    const { onSortColumn, sortColumn } = this.props;
    let sortType = this.getSortType();

    if (sortColumn === dataKey) {
      sortType = sortType === SORT_TYPE.ASC ? SORT_TYPE.DESC : SORT_TYPE.ASC;
      this.setState({
        sortType
      });
    }
    onSortColumn && onSortColumn(dataKey, sortType);
  };

  _cacheCells = null;
  _cacheChildrenSize = 0;

  getCells() {
    if (this._cacheCells) {
      return this._cacheCells;
    }
    let left = 0; // Cell left margin
    const headerCells = []; // Table header cell
    const bodyCells = []; // Table body cell
    const children = this.props.children;

    if (!children) {
      this._cacheCells = {
        headerCells,
        bodyCells,
        allColumnsWidth: left
      };
      return this._cacheCells;
    }

    let columns = children;

    if (_.isArray(children)) {
      columns = children.filter(col => col);
    }

    const { width: tableWidth } = this.state;
    const { sortColumn, rowHeight, showHeader } = this.props;
    const headerHeight = this.getTableHeaderHeight();
    const { totalFlexGrow, totalWidth } = getTotalByColumns(columns);

    React.Children.forEach(columns, (column, index) => {
      if (React.isValidElement(column)) {
        const columnChildren = column.props.children;
        const { width, resizable, flexGrow, minWidth, onResize } = column.props;

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
          ..._.pick(column.props, columnHandledProps),
          left,
          index,
          headerHeight,
          key: index,
          width: nextWidth,
          height: rowHeight,
          firstColumn: index === 0,
          lastColumn: index === columns.length - 1
        };

        if (showHeader && headerHeight) {
          const headerCellProps = {
            dataKey: columnChildren[1].props.dataKey,
            isHeaderCell: true,
            sortable: column.props.sortable,
            onSortColumn: this.handleSortColumn,
            sortType: this.getSortType(),
            sortColumn,
            flexGrow
          };

          if (resizable) {
            _.merge(headerCellProps, {
              onResize,
              onColumnResizeEnd: this.handleColumnResizeEnd,
              onColumnResizeStart: this.handleColumnResizeStart,
              onColumnResizeMove: this.handleColumnResizeMove
            });
          }

          headerCells.push(
            React.cloneElement(columnChildren[0], {
              ...cellProps,
              ...headerCellProps
            })
          );
        }

        bodyCells.push(React.cloneElement(columnChildren[1], cellProps));

        left += nextWidth;
      }
    });

    this._cacheCells = {
      headerCells,
      bodyCells,
      allColumnsWidth: left
    };

    return this._cacheCells;
  }
  handleColumnResizeEnd = (
    columnWidth: number,
    cursorDelta: number,
    dataKey: any,
    index: number
  ) => {
    this._cacheCells = null;
    this.setState({
      isColumnResizing: false,
      [`${dataKey}_${index}_width`]: columnWidth
    });

    addStyle(this.mouseArea, {
      display: 'none'
    });
  };

  handleColumnResizeStart = (width: number, left: number, fixed: boolean) => {
    this.setState({
      isColumnResizing: true
    });
    this.handleColumnResizeMove(width, left, fixed);
  };

  handleColumnResizeMove = (width: number, left: number, fixed: boolean) => {
    let mouseAreaLeft = width + left;
    let x = mouseAreaLeft;
    let dir = 'left';

    if (isRTL()) {
      mouseAreaLeft += this.minScrollX + SCROLLBAR_WIDTH;
      dir = 'right';
    }

    if (!fixed) {
      x = mouseAreaLeft + (isRTL() ? -this.scrollX : this.scrollX);
    }

    const styles = { display: 'block', [dir]: `${x}px` };

    addStyle(this.mouseArea, styles);
  };

  handleTreeToggle = (rowKey: any, rowIndex: number, rowData: any) => {
    const { onExpandChange } = this.props;
    const expandedRowKeys = this.getExpandedRowKeys();

    let open = false;
    const nextExpandedRowKeys = [];

    for (let i = 0; i < expandedRowKeys.length; i++) {
      let key = expandedRowKeys[i];
      if (key === rowKey) {
        open = true;
      } else {
        nextExpandedRowKeys.push(key);
      }
    }

    if (!open) {
      nextExpandedRowKeys.push(rowKey);
    }
    this.setState({
      expandedRowKeys: nextExpandedRowKeys
    });
    onExpandChange && onExpandChange(!open, rowData);
  };

  handleScrollX = (delta: number) => {
    this.handleWheel(delta, 0);
  };
  handleScrollY = (delta: number) => {
    this.handleWheel(0, delta);
  };

  disableEventsTimeoutId = null;

  handleWheel = (deltaX: number, deltaY: number) => {
    const { onScroll, virtualized } = this.props;
    const { contentWidth, width } = this.state;

    if (!this.table) {
      return;
    }

    const nextScrollX = contentWidth <= width ? 0 : this.scrollX - deltaX;
    const nextScrollY = this.scrollY - deltaY;

    this.scrollY = Math.min(0, nextScrollY < this.minScrollY ? this.minScrollY : nextScrollY);
    this.scrollX = Math.min(0, nextScrollX < this.minScrollX ? this.minScrollX : nextScrollX);
    this.updatePosition();

    onScroll && onScroll(this.scrollX, this.scrollY);

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
  handleTouchStart = (event: SyntheticTouchEvent<*>) => {
    const { onTouchStart } = this.props;
    const { pageX, pageY } = event.touches ? event.touches[0] : {};
    this.touchX = pageX;
    this.touchY = pageY;
    onTouchStart && onTouchStart(event);
  };

  // 处理移动端 Touch 事件, Move 的时候初始化，更新 scroll
  handleTouchMove = (event: SyntheticTouchEvent<*>) => {
    const { onTouchMove, autoHeight } = this.props;
    const { pageX: nextPageX, pageY: nextPageY } = event.touches ? event.touches[0] : {};
    const deltaX = this.touchX - nextPageX;
    const deltaY = autoHeight ? 0 : this.touchY - nextPageY;

    if (!this.shouldHandleWheelY(deltaY) && !this.shouldHandleWheelX(deltaX)) {
      return;
    }

    event.preventDefault();

    this.handleWheel(deltaX, deltaY);
    this.scrollbarX.onWheelScroll(deltaX);
    this.scrollbarY.onWheelScroll(deltaY);
    this.touchX = nextPageX;
    this.touchY = nextPageY;

    onTouchMove && onTouchMove(event);
  };

  /**
   * 当用户在 Table 内使用 tab 键，触发了 onScroll 事件，这个时候应该更新滚动条位置
   * https://github.com/rsuite/rsuite/issues/234
   */
  handleBodyScroll = (event: SyntheticTouchEvent<*>) => {
    if (event.target !== this.tableBody) {
      return;
    }

    let left = scrollLeft(event.target);
    let top = scrollTop(event.target);

    if (top === 0 && left === 0) {
      return;
    }

    this._listenWheel(left, top);

    scrollLeft(event.target, 0);
    scrollTop(event.target, 0);
  };

  initPosition() {
    if (isRTL()) {
      setTimeout(() => {
        const { contentWidth, width } = this.state;

        this.scrollX = width - contentWidth - SCROLLBAR_WIDTH;
        this.updatePosition();
        this.scrollbarX && this.scrollbarX.resetScrollBarPosition(-this.scrollX);
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
      this.wheelWrapper && addStyle(this.wheelWrapper, wheelStyle);
      this.headerWrapper && addStyle(this.headerWrapper, headerStyle);
    }

    if (this.tableHeader) {
      toggleClass(this.tableHeader, this.addPrefix('cell-group-shadow'), this.scrollY < 0);
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
      let group = scrollArrayGroups[i];
      addStyle(group, wheelGroupStyle);
    }

    if (this.wheelWrapper) {
      addStyle(this.wheelWrapper, wheelStyle);
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

  shouldRenderExpandedRow(rowData: Object) {
    const { rowKey, renderRowExpanded, isTree } = this.props;
    const expandedRowKeys = this.getExpandedRowKeys() || [];

    return (
      _.isFunction(renderRowExpanded) &&
      !isTree &&
      expandedRowKeys.some(key => key === rowData[rowKey])
    );
  }

  tableRows = {};
  mounted = false;
  scrollY = 0;
  scrollX = 0;
  wheelHandler: any;
  scrollbarX: any;
  scrollbarY: any;
  minScrollY: any;
  minScrollX: any;
  table: any;
  mouseArea: any;
  touchX: any;
  touchY: any;
  tableHeader: any;
  headerWrapper: any;
  tableBody: any;
  wheelWrapper: any;
  wheelListener: any;
  touchStartListener: any;
  touchMoveListener: any;

  addPrefix = (name: string) => prefix(this.props.classPrefix)(name);

  calculateRowMaxHeight() {
    const { wordWrap } = this.props;
    if (wordWrap) {
      const tableRowsMaxHeight = [];
      const tableRows = Object.entries(this.tableRows);

      for (let i = 0; i < tableRows.length; i++) {
        let [, row] = tableRows[i];
        if (row) {
          let cells = row.querySelectorAll(`.${this.addPrefix('cell-wrap')}`) || [];
          let maxHeight = 0;
          let cellArray = Array.from(cells);
          for (let j = 0; j < cellArray.length; j++) {
            let cell = cellArray[j];
            let h = getHeight(cell);
            maxHeight = Math.max(maxHeight, h);
          }
          tableRowsMaxHeight.push(maxHeight);
        }
      }

      this.setState({ tableRowsMaxHeight });
    }
  }

  calculateTableWidth = () => {
    const table = this.table;
    const { width } = this.state;
    if (table) {
      const nextWidth = getWidth(table);

      if (width !== nextWidth) {
        this.scrollX = 0;
        this.scrollbarX && this.scrollbarX.resetScrollBarPosition();
      }

      this._cacheCells = null;
      this.setState({
        width: nextWidth
      });
    }
    this.setAffixHeaderOffset();
  };

  calculateTableContentWidth(prevProps: Props) {
    const table = this.table;
    const row = table.querySelector(`.${this.addPrefix('row')}:not(.virtualized)`);
    const contentWidth = row ? getWidth(row) : 0;

    this.setState({ contentWidth });
    // 这里 -SCROLLBAR_WIDTH 是为了让滚动条不挡住内容部分
    this.minScrollX = -(contentWidth - this.state.width) - SCROLLBAR_WIDTH;

    /**
     * 1.判断 Table 列数是否发生变化
     * 2.判断 Table 内容区域是否宽度有变化
     *
     *
     * 满足 1 和 2 则更新横向滚动条位置
     */

    if (
      _.flatten(this.props.children).length !== _.flatten(prevProps.children).length &&
      this.state.contentWidth !== contentWidth
    ) {
      this.scrollLeft(0);
    }
  }

  calculateTableContextHeight(prevProps: Props) {
    const table = this.table;
    const rows = table.querySelectorAll(`.${this.addPrefix('row')}`) || [];
    const { height, autoHeight, rowHeight } = this.props;
    const headerHeight = this.getTableHeaderHeight();
    const contentHeight = rows.length
      ? Array.from(rows)
          .map(row => getHeight(row) || rowHeight)
          .reduce((x, y) => x + y)
      : 0;

    const nextContentHeight = contentHeight - headerHeight;
    this.setState({
      contentHeight: nextContentHeight
    });

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

  /**
   * public method
   * top 值是表格理论滚动位置的一个值，通过 top 计算出 scrollY 坐标值与滚动条位置的值
   */
  scrollTop = (top: number = 0) => {
    this.scrollY = -top;
    this.scrollbarY && this.scrollbarY.resetScrollBarPosition(top);
    this.updatePosition();
  };

  // public method
  scrollLeft = (left: number = 0) => {
    this.scrollX = -left;
    this.scrollbarX && this.scrollbarX.resetScrollBarPosition(left);
    this.updatePosition();
  };

  bindTableRowsRef = (index: number) => (ref: React.ElementRef<*>) => {
    if (ref) {
      this.tableRows[index] = ref;
    }
  };

  bindMouseAreaRef = (ref: React.ElementRef<*>) => {
    this.mouseArea = ref;
  };

  bindTableHeaderRef = (ref: React.ElementRef<*>) => {
    this.tableHeader = ref;
  };

  bindHeaderWrapperRef = (ref: React.ElementRef<*>) => {
    this.headerWrapper = ref;
  };

  bindAffixHeaderRef = (ref: React.ElementRef<*>) => {
    this.affixHeaderWrapper = ref;
  };

  bindTableRef = (ref: React.ElementRef<*>) => {
    this.table = ref;
  };

  bindWheelWrapperRef = (ref: React.ElementRef<*>) => {
    const { bodyRef } = this.props;
    this.wheelWrapper = ref;
    bodyRef && bodyRef(ref);
  };

  bindBodyRef = (ref: React.ElementRef<*>) => {
    this.tableBody = ref;
  };

  bindScrollbarXRef = (ref: React.ElementRef<*>) => {
    this.scrollbarX = ref;
  };

  bindScrollbarYRef = (ref: React.ElementRef<*>) => {
    this.scrollbarY = ref;
  };

  bindRowClick = (rowData: Object) => {
    const { onRowClick } = this.props;
    return (event: SyntheticEvent<*>) => {
      onRowClick && onRowClick(rowData, event);
    };
  };

  renderRowData(
    bodyCells: Array<any>,
    rowData: Object,
    props: Object,
    shouldRenderExpandedRow?: boolean
  ) {
    const { renderTreeToggle, rowKey, wordWrap, isTree } = this.props;
    const hasChildren = isTree && rowData.children && Array.isArray(rowData.children);
    const nextRowKey = typeof rowData[rowKey] !== 'undefined' ? rowData[rowKey] : props.index;

    const rowProps = {
      rowRef: this.bindTableRowsRef(props.index),
      onClick: this.bindRowClick(rowData),
      key: props.index,
      width: props.rowWidth,
      height: props.rowHeight,
      top: props.top
    };

    const expandedRowKeys = this.getExpandedRowKeys() || [];
    const expanded = expandedRowKeys.some(key => key === rowData[rowKey]);
    const cells = [];

    for (let i = 0; i < bodyCells.length; i++) {
      let cell = bodyCells[i];
      cells.push(
        React.cloneElement(cell, {
          hasChildren,
          rowData,
          wordWrap,
          renderTreeToggle,
          height: props.rowHeight,
          rowIndex: props.index,
          depth: props.depth,
          onTreeToggle: this.handleTreeToggle,
          rowKey: nextRowKey,
          className: classNames({ [this.addPrefix('cell-expanded')]: expanded })
        })
      );
    }

    return this.renderRow(rowProps, cells, shouldRenderExpandedRow, rowData);
  }

  renderRow(props: Object, cells: Array<any>, shouldRenderExpandedRow?: boolean, rowData?: Object) {
    const { rowClassName } = this.props;
    const { shouldFixedColumn, width, contentWidth } = this.state;

    props.updatePosition = this.translateDOMPositionXY;

    if (typeof rowClassName === 'function') {
      props.className = rowClassName(rowData);
    } else {
      props.className = rowClassName;
    }

    const rowStyles = {};
    let rowRight = 0;

    if (isRTL() && contentWidth > width) {
      rowRight = width - contentWidth;
      rowStyles.right = rowRight;
    }

    // IF there are fixed columns, add a fixed group
    if (shouldFixedColumn && contentWidth > width) {
      let fixedLeftCells = [];
      let fixedRightCells = [];
      let scrollCells = [];
      let fixedLeftCellGroupWidth = 0;
      let fixedRightCellGroupWidth = 0;

      for (let i = 0; i < cells.length; i++) {
        let cell = cells[i];
        const { fixed, width } = cell.props;

        let isFixedStart = fixed === 'left' || fixed === true;
        let isFixedEnd = fixed === 'right';

        if (isRTL()) {
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
        <Row {...props} style={rowStyles}>
          {fixedLeftCellGroupWidth ? (
            <CellGroup
              fixed="left"
              height={props.isHeaderRow ? props.headerHeight : props.height}
              width={fixedLeftCellGroupWidth}
              updatePosition={this.translateDOMPositionXY}
              style={isRTL() ? { right: width - fixedLeftCellGroupWidth - rowRight } : null}
            >
              {colSpanCells(resetLeftForCells(fixedLeftCells))}
            </CellGroup>
          ) : null}

          <CellGroup updatePosition={this.translateDOMPositionXY}>
            {colSpanCells(scrollCells)}
          </CellGroup>

          {fixedRightCellGroupWidth ? (
            <CellGroup
              fixed="right"
              style={
                isRTL()
                  ? { right: 0 - rowRight - SCROLLBAR_WIDTH }
                  : { left: width - fixedRightCellGroupWidth - SCROLLBAR_WIDTH }
              }
              height={props.isHeaderRow ? props.headerHeight : props.height}
              width={fixedRightCellGroupWidth}
              updatePosition={this.translateDOMPositionXY}
            >
              {colSpanCells(resetLeftForCells(fixedRightCells))}
            </CellGroup>
          ) : null}

          {shouldRenderExpandedRow && this.renderRowExpanded(rowData)}
        </Row>
      );
    }

    return (
      <Row {...props} style={rowStyles}>
        <CellGroup updatePosition={this.translateDOMPositionXY}>{colSpanCells(cells)}</CellGroup>
        {shouldRenderExpandedRow && this.renderRowExpanded(rowData)}
      </Row>
    );
  }

  renderRowExpanded(rowData?: Object) {
    const { renderRowExpanded, rowExpandedHeight } = this.props;
    const styles = {
      height: rowExpandedHeight
    };

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
      <div ref={this.bindMouseAreaRef} className={this.addPrefix('mouse-area')} style={styles}>
        <span style={spanStyles} />
      </div>
    );
  }

  renderTableHeader(headerCells: Array<any>, rowWidth: number) {
    const { rowHeight, affixHeader } = this.props;
    const { width: tableWidth } = this.state;
    const top = typeof affixHeader === 'number' ? affixHeader : 0;
    const headerHeight = this.getTableHeaderHeight();
    const rowProps = {
      rowRef: this.bindTableHeaderRef,
      width: rowWidth,
      height: rowHeight,
      headerHeight,
      isHeaderRow: true,
      top: 0
    };

    const fixedStyle = {
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
        ref={this.bindAffixHeaderRef}
      >
        {this.renderRow(rowProps, headerCells)}
      </div>
    );

    return (
      <React.Fragment>
        {(affixHeader === 0 || affixHeader) && header}
        <div className={this.addPrefix('header-row-wrapper')} ref={this.bindHeaderWrapperRef}>
          {this.renderRow(rowProps, headerCells)}
        </div>
      </React.Fragment>
    );
  }
  _visibleRows = [];

  renderTableBody(bodyCells: Array<any>, rowWidth: number) {
    const {
      rowHeight,
      rowExpandedHeight,
      renderRowExpanded,
      isTree,
      setRowHeight,
      rowKey,
      wordWrap,
      virtualized
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
      const isUncertainHeight = !!(renderRowExpanded || setRowHeight || isTree);

      /**
      如果开启了 virtualized  同时 Table 中的的行高是可变的，
      则需要循环遍历 data, 获取每一行的高度。
      */
      if ((isUncertainHeight && virtualized) || !virtualized) {
        for (let index = 0; index < data.length; index++) {
          let rowData = data[index];
          let maxHeight = tableRowsMaxHeight[index];
          let nextRowHeight = maxHeight ? maxHeight + CELL_PADDING_HEIGHT : rowHeight;
          let shouldRenderExpandedRow = this.shouldRenderExpandedRow(rowData);
          let depth = 0;

          if (shouldRenderExpandedRow) {
            nextRowHeight += rowExpandedHeight;
          }

          if (isTree) {
            const parents = findAllParents(rowData, rowKey);
            const expandedRowKeys = this.getExpandedRowKeys();
            depth = parents.length;

            // 树节点如果被关闭，则不渲染
            if (!shouldShowRowByExpanded(expandedRowKeys, parents)) {
              continue;
            }
          }

          /**
           * 自定义行高
           */
          if (setRowHeight) {
            nextRowHeight = setRowHeight(rowData) || rowHeight;
          }

          contentHeight += nextRowHeight;

          let rowProps = {
            index,
            top,
            rowWidth,
            depth,
            rowHeight: nextRowHeight
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

        const startIndex = Math.max(Math.floor(minTop / rowHeight), 0);
        const endIndex = Math.min(startIndex + Math.ceil(bodyHeight / rowHeight), data.length);

        contentHeight = data.length * rowHeight;
        topHideHeight = startIndex * rowHeight;
        bottomHideHeight = (data.length - endIndex) * rowHeight;

        for (let index = startIndex; index < endIndex; index++) {
          let rowData = data[index];
          let rowProps = {
            index,
            top: index * rowHeight,
            rowWidth,
            rowHeight
          };
          this._visibleRows.push(this.renderRowData(bodyCells, rowData, rowProps, false));
        }
      }
    }

    const wheelStyles = {
      position: 'absolute',
      height: contentHeight,
      minHeight: height,
      pointerEvents: isScrolling ? 'none' : ''
    };
    const topRowStyles = { height: topHideHeight };
    const bottomRowStyles = { height: bottomHideHeight };

    return (
      <div
        ref={this.bindBodyRef}
        className={this.addPrefix('body-row-wrapper')}
        style={bodyStyles}
        onScroll={this.handleBodyScroll}
      >
        <div
          style={wheelStyles}
          className={this.addPrefix('body-wheel-area')}
          ref={this.bindWheelWrapperRef}
        >
          {topHideHeight ? (
            <Row
              style={topRowStyles}
              className="virtualized"
              updatePosition={this.translateDOMPositionXY}
            />
          ) : null}
          {this._visibleRows}
          {bottomHideHeight ? (
            <Row
              style={bottomRowStyles}
              className="virtualized"
              updatePosition={this.translateDOMPositionXY}
            />
          ) : null}
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
    const { disabledScroll } = this.props;
    const { contentWidth, contentHeight } = this.state;

    const headerHeight = this.getTableHeaderHeight();
    const height = this.getTableHeight();

    if (disabledScroll) {
      return null;
    }

    return (
      <div>
        <Scrollbar
          length={this.state.width}
          onScroll={this.handleScrollX}
          scrollLength={contentWidth}
          ref={this.bindScrollbarXRef}
        />
        <Scrollbar
          vertical
          length={height - headerHeight}
          scrollLength={contentHeight}
          onScroll={this.handleScrollY}
          ref={this.bindScrollbarYRef}
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
    const { headerCells, bodyCells, allColumnsWidth } = this.getCells();
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
      <div {...unhandled} className={clesses} style={styles} ref={this.bindTableRef}>
        {showHeader && this.renderTableHeader(headerCells, rowWidth)}
        {children && this.renderTableBody(bodyCells, rowWidth)}
        {showHeader && this.renderMouseArea()}
      </div>
    );
  }
}

export default Table;
