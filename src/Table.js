// @flow

import * as React from 'react';
import classNames from 'classnames';
import _ from 'lodash';

import onResize from 'element-resize-event';

import {
  addStyle,
  addClass,
  removeClass,
  hasClass,
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

type Props = {
  width?: number,
  data?: Array<Object>,
  height: number,
  rowHeight: number,
  headerHeight?: number,
  onRowClick?: Function,
  isTree?: boolean,
  expand?: boolean,
  locale: Object,
  style?: Object,
  sortColumn?: string,
  sortType: 'desc' | 'asc',
  /**
   * @callback
   * @params: sortColumn dataKey
   * @params: sortType
   */
  onSortColumn?: Function,
  onRerenderRowHeight?: Function,
  onTreeToggle?: Function,
  renderTreeToggle?: Function,
  disabledScroll?: boolean,
  hover: boolean,
  loading?: boolean,
  className?: string,
  classPrefix?: string,
  children?: React.ChildrenArray<*>,
  bordered?: boolean,
  wordWrap?: boolean,
  onScroll?: Function,

  onTouchStart?: Function, // for tests
  onTouchMove?: Function // for tests
};

type State = {
  width: number,
  columnWidth: number,
  dataKey: number,
  shouldFixedColumn: boolean,
  contentHeight: number,
  contentWidth: number,
  tableRowsMaxHeight: Array<number>,
  isColumnResizing?: boolean
};

class Table extends React.Component<Props, State> {
  static defaultProps = {
    classPrefix: defaultClassPrefix('table'),
    height: 200,
    rowHeight: 36,
    sortType: 'asc',
    hover: true,
    locale: {
      emptyMessage: 'No data found',
      loading: 'Loading...'
    }
  };
  constructor(props: Props) {
    super(props);
    this.state = {
      width: props.width || 0,
      columnWidth: 0,
      dataKey: 0,
      shouldFixedColumn: false,
      contentHeight: 0,
      contentWidth: 0,
      tableRowsMaxHeight: []
    };
  }
  componentWillMount() {
    const { children = [] } = this.props;
    const shouldFixedColumn = Array.from(children).some(child => _.get(child, 'props.fixed'));

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
    return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);
  }
  componentDidUpdate() {
    this.calculateTableContextHeight();
    this.calculateTableContentWidth();
    this.calculateRowMaxHeight();
    this.updatePosition();
  }

  getTableHeaderRef = (ref: React.ElementRef<*>) => {
    this.tableHeader = ref;
  };

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
            (tableWidth - totalWidth) / totalFlexGrow * flexGrow,
            minWidth || 60
          );
        }

        const columnHandledProps = [
          'align',
          'width',
          'fixed',
          'resizable',
          'sortable',
          'flexGrow',
          'minWidth',
          'colSpan'
        ];

        let cellProps = {
          ..._.pick(column.props, columnHandledProps),
          left,
          index,
          headerHeight,
          width: nextWidth,
          height: rowHeight,
          firstColumn: index === 0,
          lastColumn: index === columns.length - 1,
          key: index
        };

        let headerCellsProps = {
          ..._.pick(column.props, columnHandledProps),
          width: nextWidth,
          headerHeight: headerHeight || rowHeight,
          dataKey: columnChildren[1].props.dataKey,
          isHeaderCell: true,
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

  treeToggle(open: boolean, iteratee?: (rowData: any) => boolean) {
    const buttons = this.treeChildren;
    const toggle = { addClass, removeClass };
    const key = open ? 'addClass' : 'removeClass';
    const openClassName = this.addPrefix('row-open');
    Object.values(buttons).forEach((item: any) => {
      if (item && typeof iteratee === 'undefined') {
        toggle[key](item.ref, openClassName);
      } else if (iteratee && iteratee(item.rowData) && item.ref) {
        toggle[key](item.ref, openClassName);
      }
    });
    this.calculateTableContextHeight();
  }

  treeToggleBy(open: boolean, iteratee: (rowData: any) => boolean) {
    this.treeToggle(open, iteratee);
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
    const { onTreeToggle } = this.props;
    const expandIcon = this.treeChildren[rowKey].ref;
    const openClassName = this.addPrefix('row-open');
    const isOpen = hasClass(expandIcon, openClassName);

    if (isOpen) {
      removeClass(expandIcon, openClassName);
    } else {
      addClass(expandIcon, openClassName);
    }

    this.calculateTableContextHeight();
    onTreeToggle && onTreeToggle(!isOpen, rowData);
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

  treeChildren = {};
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
        let cells = row.querySelectorAll('.rsuite-table-cell-wrap') || [];
        let maxHeight = 0;
        cells.forEach(cell => {
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
    if (this.state.contentWidth !== contentWidth) {
      this.scrollX = 0;
      this.scrollbarX && this.scrollbarX.resetScrollBarPosition();
    }
  }

  calculateTableContextHeight() {
    const table = this.table;
    const rows = table.querySelectorAll(`.${this.addPrefix('row')}`);
    const { height, rowHeight, headerHeight } = this.props;
    let contentHeight = 0;
    Array.from(rows).forEach(row => {
      contentHeight += getHeight(row);
    });

    const nextContentHeight = contentHeight - (headerHeight || rowHeight);
    this.setState({
      contentHeight: nextContentHeight
    });
    // 这里 -10 是为了让滚动条不挡住内容部分
    this.minScrollY = -(contentHeight - height) - 10;
    if (this.state.contentHeight !== nextContentHeight) {
      this.scrollY = 0;
      this.scrollbarY && this.scrollbarY.resetScrollBarPosition();
    }
  }

  renderRowData(bodyCells: Array<any>, rowData: Object, props: Object) {
    const { onRowClick, renderTreeToggle, wordWrap } = this.props;
    const hasChildren = this.props.isTree && rowData.children && Array.isArray(rowData.children);
    const rowKey = `_${(Math.random() * 1e18)
      .toString(36)
      .slice(0, 5)
      .toUpperCase()}_${props.index}`;

    const row = this.renderRow(
      {
        rowRef: ref => {
          this.tableRows[props.index] = ref;
        },
        key: props.index,
        width: props.rowWidth,
        height: props.rowHeight,
        top: props.top,
        onClick: () => {
          onRowClick && onRowClick(rowData);
        }
      },
      bodyCells.map(cell =>
        React.cloneElement(cell, {
          hasChildren,
          layer: props.layer,
          height: props.rowHeight,
          rowIndex: props.index,
          renderTreeToggle,
          onTreeToggle: this.handleTreeToggle,
          rowKey,
          rowData,
          wordWrap
        })
      )
    );

    // insert children
    if (hasChildren) {
      props.layer += 1;

      const childrenClasses = classNames(this.addPrefix('row-has-children'), {
        [this.addPrefix('row-open')]: this.props.expand
      });

      return (
        <div
          className={childrenClasses}
          key={props.index}
          data-layer={props.layer}
          ref={ref => {
            if (ref) {
              this.treeChildren[rowKey] = { ref, rowData };
            }
          }}
        >
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

  renderRow(props: Object, cells: Array<any>) {
    // IF there are fixed columns, add a fixed group
    if (this.state.shouldFixedColumn) {
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
        </Row>
      );
    }

    return (
      <Row {...props}>
        <CellGroup>{colSpanCells(cells)}</CellGroup>
      </Row>
    );
  }

  renderMouseArea() {
    const { height } = this.props;
    const styles = { height };

    return (
      <div
        ref={ref => {
          this.mouseArea = ref;
        }}
        className={this.addPrefix('mouse-area')}
        style={styles}
      />
    );
  }

  renderTableHeader(headerCells: Array<any>, rowWidth: number) {
    const { rowHeight, headerHeight } = this.props;
    const row = this.renderRow(
      {
        rowRef: this.getTableHeaderRef,
        width: rowWidth,
        height: rowHeight,
        headerHeight,
        isHeaderRow: true,
        top: 0
      },
      headerCells
    );

    return (
      <div
        ref={ref => {
          this.headerWrapper = ref;
        }}
        className={this.addPrefix('header-row-wrapper')}
      >
        {row}
      </div>
    );
  }
  renderTableBody(bodyCells: Array<any>, rowWidth: number) {
    const { headerHeight, rowHeight, height, data, isTree, onRerenderRowHeight } = this.props;
    const { tableRowsMaxHeight } = this.state;
    const bodyStyles = {
      top: isTree ? 0 : headerHeight || rowHeight,
      height: height - (headerHeight || rowHeight)
    };

    let top = 0; // Row position
    let rows = null;
    if (data && data.length > 0) {
      rows = data.map((rowData, index) => {
        let maxHeight = tableRowsMaxHeight[index];
        let nextRowHeight = maxHeight ? maxHeight + 18 : rowHeight;

        /**
         * 自定义行高
         */
        if (onRerenderRowHeight) {
          nextRowHeight = onRerenderRowHeight(rowData) || rowHeight;
        }

        let row = this.renderRowData(bodyCells, rowData, {
          index,
          top,
          rowWidth,
          layer: 0,
          rowHeight: nextRowHeight
        });

        !isTree && (top += nextRowHeight);
        return row;
      });
    }

    const wheelStyles = {
      position: 'absolute'
    };

    return (
      <div
        ref={ref => {
          this.tableBody = ref;
        }}
        className={this.addPrefix('body-row-wrapper')}
        style={bodyStyles}
        onTouchStart={this.handleTouchStart}
        onTouchMove={this.handleTouchMove}
        onWheel={this.wheelHandler.onWheel}
      >
        <div
          style={wheelStyles}
          className={this.addPrefix('body-wheel-area')}
          ref={ref => {
            this.wheelWrapper = ref;
          }}
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
    const { disabledScroll, headerHeight, rowHeight, height, loading } = this.props;

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
          ref={ref => {
            this.scrollbarX = ref;
          }}
        />
        <Scrollbar
          vertical
          length={height - (headerHeight || rowHeight)}
          scrollLength={contentHeight}
          onScroll={this.handleScrollY}
          ref={ref => {
            this.scrollbarY = ref;
          }}
        />
      </div>
    );
  }

  /**
   *  show loading
   */
  renderLoading() {
    const { loading, locale } = this.props;

    if (!loading) {
      return null;
    }

    return (
      <div className={this.addPrefix('loading-wrapper')}>
        <div className={this.addPrefix('loading')}>
          <div>
            <i className="icon icon-cog icon-lg icon-spin" />
            <span>{locale.loading}</span>
          </div>
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
      wordWrap,
      classPrefix,
      ...rest
    } = this.props;

    const { isColumnResizing } = this.state;
    const { headerCells, bodyCells, allColumnsWidth } = this.getCells();
    const rowWidth = allColumnsWidth > width ? allColumnsWidth : width;
    const clesses = classNames(classPrefix, className, {
      [this.addPrefix('word-wrap')]: wordWrap,
      [this.addPrefix('treetable')]: isTree,
      [this.addPrefix('bordered')]: bordered,
      [this.addPrefix('column-resizing')]: isColumnResizing,
      [this.addPrefix('hover')]: hover
    });

    const styles = {
      width: width || 'auto',
      height,
      ...style
    };

    const unhandled = getUnhandledProps(Table, rest);

    return (
      <div
        {...unhandled}
        className={clesses}
        style={styles}
        ref={ref => {
          this.table = ref;
        }}
      >
        {this.renderTableHeader(headerCells, rowWidth)}
        {children && this.renderTableBody(bodyCells, rowWidth)}
        {this.renderMouseArea()}
      </div>
    );
  }
}

export default Table;
