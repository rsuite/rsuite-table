// @flow

import * as React from 'react';
import classNames from 'classnames';
import _ from 'lodash';
import onResize from 'element-resize-event';

import {
  addStyle,
  addClass,
  removeClass,
  getWidth,
  getHeight,
  translateDOMPositionXY,
  WheelHandler
} from 'dom-lib';

import Row from './Row';
import CellGroup from './CellGroup';
import Scrollbar from './Scrollbar';

import {
  getTotalByColumns,
  colSpanCells,
  getUnhandledProps,
  defaultClassPrefix,
  prefix
} from './utils';

const handleClass = { add: addClass, remove: removeClass };
const ReactChildren = React.Children;
const CELL_PADDING_HEIGHT = 26;

type SortType = 'desc' | 'asc';
type Props = {
  width?: number,
  data: Array<Object>,
  height: number,
  rowHeight: number,
  setRowHeight?: (rowData: Object) => number,
  rowKey: string | number,
  headerHeight: number,

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
  sortType: SortType,

  disabledScroll?: boolean,

  hover: boolean,
  loading?: boolean,
  className?: string,
  classPrefix?: string,
  children?: React.ChildrenArray<*>,
  bordered?: boolean,
  cellBordered?: boolean,
  wordWrap?: boolean,
  onRowClick?: (rowData: Object) => void,
  onScroll?: (scrollX: number, scrollY: number) => void,
  onSortColumn?: (dataKey: string, sortType: SortType) => void,
  onExpandChange?: (expanded: boolean, rowData: Object) => void,
  onTouchStart?: (event: SyntheticTouchEvent<*>) => void, // for tests
  onTouchMove?: (event: SyntheticTouchEvent<*>) => void, // for tests
  bodyRef?: React.ElementRef<*>,
  loadAnimation?: boolean
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
  expandedRowKeys: Array<string | number>
};

function findRowKeys(rows, rowKey, expanded) {
  let keys = [];
  rows.forEach(item => {
    if (item.children) {
      keys.push(item[rowKey]);
      keys = [...keys, ...findRowKeys(item.children, rowKey)];
    } else if (expanded) {
      keys.push(item[rowKey]);
    }
  });
  return keys;
}

class Table extends React.Component<Props, State> {
  static defaultProps = {
    classPrefix: defaultClassPrefix('table'),
    data: [],
    height: 200,
    rowHeight: 46,
    headerHeight: 40,
    rowExpandedHeight: 100,
    sortType: 'asc',
    hover: true,
    rowKey: 'key',
    locale: {
      emptyMessage: 'No data found',
      loading: 'Loading...'
    }
  };
  constructor(props: Props) {
    super(props);
    const {
      width,
      data,
      rowKey,
      defaultExpandAllRows,
      renderRowExpanded,
      defaultExpandedRowKeys
    } = props;
    const expandedRowKeys = defaultExpandAllRows
      ? findRowKeys(data, rowKey, _.isFunction(renderRowExpanded))
      : defaultExpandedRowKeys || [];

    this.state = {
      expandedRowKeys,
      width: width || 0,
      columnWidth: 0,
      dataKey: 0,
      shouldFixedColumn: false,
      contentHeight: 0,
      contentWidth: 0,
      tableRowsMaxHeight: []
    };
  }

  componentWillMount() {
    const { children = [], isTree, rowKey } = this.props;
    const shouldFixedColumn = Array.from(children).some((child: any) =>
      _.get(child, 'props.fixed')
    );

    if (isTree && !rowKey) {
      throw new Error('The `rowKey` is required when set isTree');
    }

    this.scrollY = 0;
    this.scrollX = 0;
    this.wheelHandler = new WheelHandler(
      (deltaX, deltaY) => {
        this.handleWheel(deltaX, deltaY);
        this.scrollbarX.onWheelScroll(deltaX);
        this.scrollbarY.onWheelScroll(deltaY);
      },
      this.shouldHandleWheelX,
      this.shouldHandleWheelY
    );
    this.setState({ shouldFixedColumn });
  }
  componentDidMount() {
    this.calculateTableWidth();
    this.calculateTableContextHeight();
    this.calculateRowMaxHeight();
    onResize(this.table, _.debounce(this.calculateTableWidth, 400));
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    return !_.eq(this.props, nextProps) || !_.isEqual(this.state, nextState);
  }

  componentDidUpdate() {
    this.calculateTableContextHeight();
    this.calculateTableContentWidth();
    this.calculateRowMaxHeight();
    this.updatePosition();
  }

  getExpandedRowKeys() {
    const { expandedRowKeys } = this.props;
    return _.isUndefined(expandedRowKeys) ? this.state.expandedRowKeys : expandedRowKeys;
  }

  getScrollCellGroups() {
    return this.table.querySelectorAll(`.${this.addPrefix('cell-group-scroll')}`);
  }

  getFixedCellGroups() {
    return this.table.querySelectorAll(`.${this.addPrefix('cell-group-fixed')}`);
  }

  getCells() {
    let left = 0; // Cell left margin
    const headerCells = []; // Table header cell
    const bodyCells = []; // Table body cell
    const columns = this.props.children;

    if (!columns) {
      return {
        headerCells,
        bodyCells,
        allColumnsWidth: left
      };
    }

    const { width: tableWidth } = this.state;
    const { sortColumn, sortType, onSortColumn, rowHeight, headerHeight } = this.props;

    const { totalFlexGrow, totalWidth } = getTotalByColumns(columns);

    ReactChildren.forEach(columns, (column, index) => {
      if (React.isValidElement(column)) {
        const columnChildren = column.props.children;
        const { width, resizable, flexGrow, minWidth } = column.props;

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

        const columnHandledProps = [
          'align',
          'width',
          'fixed',
          'resizable',
          'flexGrow',
          'minWidth',
          'colSpan'
        ];

        let cellProps = {
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

        let headerCellsProps = {
          dataKey: columnChildren[1].props.dataKey,
          isHeaderCell: true,
          sortable: column.props.sortable,
          sortColumn,
          sortType,
          onSortColumn,
          flexGrow
        };

        if (resizable) {
          _.merge(headerCellsProps, {
            onColumnResizeEnd: this.handleColumnResizeEnd,
            onColumnResizeStart: this.handleColumnResizeStart,
            onColumnResizeMove: this.handleColumnResizeMove
          });
        }

        headerCells.push(
          React.cloneElement(columnChildren[0], {
            ...cellProps,
            ...headerCellsProps
          })
        );
        bodyCells.push(React.cloneElement(columnChildren[1], cellProps));

        left += nextWidth;
      }
    });

    return {
      headerCells,
      bodyCells,
      allColumnsWidth: left
    };
  }
  handleColumnResizeEnd = (
    columnWidth: number,
    cursorDelta: number,
    dataKey: any,
    index: number
  ) => {
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
    const mouseAreaLeft = width + left;
    const x = fixed ? mouseAreaLeft : mouseAreaLeft + (this.scrollX || 0);
    const styles = { display: 'block' };
    translateDOMPositionXY(styles, x, 0);
    addStyle(this.mouseArea, styles);
  };

  handleColumnResizeMove = (width: number, left: number, fixed: boolean) => {
    const mouseAreaLeft = width + left;
    const x = fixed ? mouseAreaLeft : mouseAreaLeft + (this.scrollX || 0);
    const styles = {};
    translateDOMPositionXY(styles, x, 0);
    addStyle(this.mouseArea, styles);
  };

  handleTreeToggle = (rowKey: any, rowIndex: number, rowData: any) => {
    const { onExpandChange } = this.props;
    const { expandedRowKeys } = this.state;

    let open = false;
    const nextExpandedRowKeys = [];
    expandedRowKeys.forEach(key => {
      if (key === rowKey) {
        open = true;
      } else {
        nextExpandedRowKeys.push(key);
      }
    });

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
  handleWheel = (deltaX: number, deltaY: number) => {
    const { onScroll } = this.props;
    if (!this.table) {
      return;
    }
    const nextScrollX = this.scrollX - deltaX;
    const nextScrollY = this.scrollY - deltaY;

    this.scrollY = Math.min(0, nextScrollY < this.minScrollY ? this.minScrollY : nextScrollY);
    this.scrollX = Math.min(0, nextScrollX < this.minScrollX ? this.minScrollX : nextScrollX);
    this.updatePosition();

    onScroll && onScroll(this.scrollX, this.scrollY);
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
    event.stopPropagation();
    event.preventDefault();

    const { onTouchMove } = this.props;
    const { pageX: nextPageX, pageY: nextPageY } = event.touches ? event.touches[0] : {};
    const deltaX = this.touchX - nextPageX;
    const deltaY = this.touchY - nextPageY;
    this.handleWheel(deltaX, deltaY);
    this.scrollbarX.onWheelScroll(deltaX);
    this.scrollbarY.onWheelScroll(deltaY);
    this.touchX = nextPageX;
    this.touchY = nextPageY;

    onTouchMove && onTouchMove(event);
  };

  updatePosition() {
    /**
     * 当存在锁定列情况处理
     */
    if (this.state.shouldFixedColumn) {
      this.updatePositionByFixedCell();
    } else {
      const wheelStyle = {};
      const headerStyle = {};
      translateDOMPositionXY(wheelStyle, this.scrollX, this.scrollY);
      translateDOMPositionXY(headerStyle, this.scrollX, 0);

      this.wheelWrapper && addStyle(this.wheelWrapper, wheelStyle);
      this.headerWrapper && addStyle(this.headerWrapper, headerStyle);
    }
    handleClass[this.scrollY < 0 ? 'add' : 'remove'](
      this.tableHeader,
      this.addPrefix('cell-group-shadow')
    );
  }
  updatePositionByFixedCell() {
    const wheelGroupStyle = {};
    const wheelStyle = {};
    const scrollGroups = this.getScrollCellGroups();
    const fixedGroups = this.getFixedCellGroups();

    translateDOMPositionXY(wheelGroupStyle, this.scrollX, 0);
    translateDOMPositionXY(wheelStyle, 0, this.scrollY);

    Array.from(scrollGroups).forEach(group => {
      addStyle(group, wheelGroupStyle);
    });
    if (this.wheelWrapper) {
      addStyle(this.wheelWrapper, wheelStyle);
    }

    Array.from(fixedGroups).forEach(group => {
      handleClass[this.scrollX < 0 ? 'add' : 'remove'](group, this.addPrefix('cell-group-shadow'));
    });
  }
  shouldHandleWheelX = (delta: number) => {
    const { disabledScroll, loading } = this.props;
    const { contentWidth, width } = this.state;
    if (delta === 0 || disabledScroll || loading) {
      return false;
    }

    if (width && contentWidth <= width) {
      return false;
    }

    return (delta >= 0 && this.scrollX > this.minScrollX) || (delta < 0 && this.scrollX < 0);
  };
  shouldHandleWheelY = (delta: number) => {
    const { disabledScroll, loading } = this.props;
    if (delta === 0 || disabledScroll || loading) {
      return false;
    }
    return (delta >= 0 && this.scrollY > this.minScrollY) || (delta < 0 && this.scrollY < 0);
  };

  tableRows = [];
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

  addPrefix = (name: string) => prefix(this.props.classPrefix)(name);

  calculateRowMaxHeight() {
    const { wordWrap } = this.props;
    if (wordWrap) {
      const tableRowsMaxHeight = [];
      this.tableRows.forEach(row => {
        let cells = row.querySelectorAll(`.${this.addPrefix('cell-wrap')}`) || [];
        let maxHeight = 0;
        Array.from(cells).forEach(cell => {
          let h = getHeight(cell);
          maxHeight = Math.max(maxHeight, h);
        });
        tableRowsMaxHeight.push(maxHeight);
      });
      this.setState({ tableRowsMaxHeight });
    }
  }

  calculateTableWidth = () => {
    const table = this.table;
    if (table) {
      this.scrollX = 0;
      this.scrollbarX && this.scrollbarX.resetScrollBarPosition();
      this.setState({
        width: getWidth(table)
      });
    }
  };

  calculateTableContentWidth() {
    const table = this.table;
    const row = table.querySelectorAll(`.${this.addPrefix('row-header')}`)[0];
    const contentWidth = getWidth(row);

    this.setState({ contentWidth });
    // 这里 -10 是为了让滚动条不挡住内容部分
    this.minScrollX = -(contentWidth - this.state.width) - 10;

    /**
     * 当 content width 更新后，更新横向滚动条
     */
    if (this.state.contentWidth !== contentWidth) {
      this.scrollX = 0;
      this.scrollbarX && this.scrollbarX.resetScrollBarPosition();
    }
  }

  calculateTableContextHeight() {
    const table = this.table;
    const rows = table.querySelectorAll(`.${this.addPrefix('row')}`);
    const { height, headerHeight } = this.props;
    let contentHeight = 0;
    Array.from(rows).forEach(row => {
      contentHeight += getHeight(row);
    });

    const nextContentHeight = contentHeight - headerHeight;
    this.setState({
      contentHeight: nextContentHeight
    });
    // 这里 -10 是为了让滚动条不挡住内容部分
    this.minScrollY = -(contentHeight - height) - 10;

    /**
     * 当 content height 更新后，更新纵向滚动条
     */
    if (this.state.contentHeight !== nextContentHeight) {
      this.scrollY = 0;
      this.scrollbarY && this.scrollbarY.resetScrollBarPosition();
    }
  }

  shouldRenderExpandedRow(rowData: Object) {
    const { rowKey, renderRowExpanded, isTree } = this.props;
    const expandedRowKeys = this.getExpandedRowKeys() || [];
    return (
      expandedRowKeys.some(key => key === rowData[rowKey]) &&
      _.isFunction(renderRowExpanded) &&
      !isTree
    );
  }

  bindTableRowsRef = (index: number) => (ref: React.ElementRef<*>) => {
    this.tableRows[index] = ref;
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

  renderRowData(
    bodyCells: Array<any>,
    rowData: Object,
    props: Object,
    shouldRenderExpandedRow?: boolean
  ) {
    const { onRowClick, renderTreeToggle, rowKey, wordWrap } = this.props;

    const hasChildren = this.props.isTree && rowData.children && Array.isArray(rowData.children);
    const nextRowKey =
      rowData[rowKey] ||
      `_${(Math.random() * 1e18)
        .toString(36)
        .slice(0, 5)
        .toUpperCase()}_${props.index}`;

    const rowProps = {
      rowRef: this.bindTableRowsRef(props.index),
      key: props.index,
      width: props.rowWidth,
      height: props.rowHeight,
      top: props.top,
      onClick: () => {
        onRowClick && onRowClick(rowData);
      }
    };

    const cells = bodyCells.map(cell =>
      React.cloneElement(cell, {
        hasChildren,
        layer: props.layer,
        height: props.rowHeight,
        rowIndex: props.index,
        renderTreeToggle,
        onTreeToggle: this.handleTreeToggle,
        rowKey: nextRowKey,
        rowData,
        wordWrap
      })
    );

    const row = this.renderRow(rowProps, cells, shouldRenderExpandedRow, rowData);

    // insert children
    if (hasChildren) {
      props.layer += 1;

      const expandedRowKeys = this.getExpandedRowKeys() || [];
      const open = expandedRowKeys.some(key => key === rowData[rowKey]);

      const childrenClasses = classNames(this.addPrefix('row-has-children'), {
        [this.addPrefix('row-open')]: open
      });

      return (
        <div className={childrenClasses} key={props.index} data-layer={props.layer}>
          {row}
          <div className={this.addPrefix('row-children')}>
            {rowData.children.map((child, index) =>
              this.renderRowData(bodyCells, child, {
                ...props,
                index
              })
            )}
          </div>
        </div>
      );
    }

    return row;
  }

  renderRow(props: Object, cells: Array<any>, shouldRenderExpandedRow?: boolean, rowData?: Object) {
    const { shouldFixedColumn } = this.state;
    // IF there are fixed columns, add a fixed group
    if (shouldFixedColumn) {
      let fixedCells = cells.filter(cell => cell.props.fixed);
      let otherCells = cells.filter(cell => !cell.props.fixed);
      let fixedCellGroupWidth = 0;

      for (let i = 0; i < fixedCells.length; i += 1) {
        fixedCellGroupWidth += fixedCells[i].props.width;
      }

      return (
        <Row {...props}>
          <CellGroup
            fixed
            height={props.isHeaderRow ? props.headerHeight : props.height}
            width={fixedCellGroupWidth}
          >
            {colSpanCells(fixedCells)}
          </CellGroup>
          <CellGroup>{colSpanCells(otherCells)}</CellGroup>
          {shouldRenderExpandedRow && this.renderRowExpanded(rowData)}
        </Row>
      );
    }

    return (
      <Row {...props}>
        <CellGroup>{colSpanCells(cells)}</CellGroup>
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
    const { height, headerHeight } = this.props;
    const styles = { height };

    return (
      <div ref={this.bindMouseAreaRef} className={this.addPrefix('mouse-area')} style={styles}>
        <span
          style={{
            height: headerHeight - 1
          }}
        />
      </div>
    );
  }

  renderTableHeader(headerCells: Array<any>, rowWidth: number) {
    const { rowHeight, headerHeight } = this.props;
    const rowProps = {
      rowRef: this.bindTableHeaderRef,
      width: rowWidth,
      height: rowHeight,
      headerHeight,
      isHeaderRow: true,
      top: 0
    };

    return (
      <div className={this.addPrefix('header-row-wrapper')} ref={this.bindHeaderWrapperRef}>
        {this.renderRow(rowProps, headerCells)}
      </div>
    );
  }

  renderTableBody(bodyCells: Array<any>, rowWidth: number) {
    const {
      headerHeight,
      rowHeight,
      rowExpandedHeight,
      height,
      data,
      isTree,
      setRowHeight
    } = this.props;

    const { tableRowsMaxHeight } = this.state;
    const bodyStyles = {
      top: isTree ? 0 : headerHeight,
      height: height - headerHeight
    };

    let top = 0; // Row position
    let rows = null;
    let bodyHeight = 0;
    if (data && data.length > 0) {
      rows = data.map((rowData, index) => {
        let maxHeight = tableRowsMaxHeight[index];
        let nextRowHeight = maxHeight ? maxHeight + CELL_PADDING_HEIGHT : rowHeight;
        let shouldRenderExpandedRow = this.shouldRenderExpandedRow(rowData);

        if (shouldRenderExpandedRow) {
          nextRowHeight += rowExpandedHeight;
        }

        /**
         * 自定义行高
         */
        if (setRowHeight) {
          nextRowHeight = setRowHeight(rowData) || rowHeight;
        }

        bodyHeight += nextRowHeight;

        let rowProps = {
          index,
          top,
          rowWidth,
          layer: 0,
          rowHeight: nextRowHeight
        };

        !isTree && (top += nextRowHeight);

        return this.renderRowData(bodyCells, rowData, rowProps, shouldRenderExpandedRow);
      });
    }

    const wheelStyles = {
      position: 'absolute',
      height: bodyHeight,
      minHeight: height
    };

    return (
      <div
        ref={this.bindBodyRef}
        className={this.addPrefix('body-row-wrapper')}
        style={bodyStyles}
        onTouchStart={this.handleTouchStart}
        onTouchMove={this.handleTouchMove}
        onWheel={this.wheelHandler.onWheel}
      >
        <div
          style={wheelStyles}
          className={this.addPrefix('body-wheel-area')}
          ref={this.bindWheelWrapperRef}
        >
          {rows}
        </div>

        {this.renderInfo(rows === null)}
        {this.renderScrollbar()}
        {this.renderLoading()}
      </div>
    );
  }

  renderInfo(shouldShow: boolean) {
    if (!shouldShow) {
      return null;
    }

    const { locale } = this.props;
    return <div className={this.addPrefix('body-info')}>{locale.emptyMessage}</div>;
  }

  renderScrollbar() {
    const { disabledScroll, headerHeight, height, loading } = this.props;
    const { contentWidth, contentHeight } = this.state;

    if (disabledScroll || loading) {
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
    const { locale, loading, loadAnimation } = this.props;

    if (!loadAnimation && !loading) {
      return null;
    }

    return (
      <div className={this.addPrefix('loader-wrapper')}>
        <div className={this.addPrefix('loader')}>
          <i className={this.addPrefix('loader-icon')} />
          <span className={this.addPrefix('loader-text')}>{locale.loading}</span>
        </div>
      </div>
    );
  }

  render() {
    const {
      children,
      className,
      width = 0,
      height,
      style,
      rowHeight,
      isTree,
      hover,
      bordered,
      cellBordered,
      wordWrap,
      classPrefix,
      loading,
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
      height,
      ...style
    };

    const unhandled = getUnhandledProps(Table, rest);

    return (
      <div {...unhandled} className={clesses} style={styles} ref={this.bindTableRef}>
        {this.renderTableHeader(headerCells, rowWidth)}
        {children && this.renderTableBody(bodyCells, rowWidth)}
        {this.renderMouseArea()}
      </div>
    );
  }
}

export default Table;
