import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import isArray from 'lodash/isArray';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import get from 'lodash/get';
import omit from 'lodash/omit';
import merge from 'lodash/merge';
import isUndefined from 'lodash/isUndefined';
import pick from 'lodash/pick';
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

import decorate, { globalClassName } from './utils/decorate';
import isNullOrUndefined from './utils/isNullOrUndefined';
import Row from './Row';
import CellGroup from './CellGroup';
import Scrollbar from './Scrollbar';
import Column from './Column';

const handleClass = { add: addClass, remove: removeClass };
const ReactChildren = React.Children;


function getTotalByColumns(columns) {
  let totalFlexGrow = 0;
  let totalWidth = 0;

  const count = (items) => {
    Array.from(items).forEach((column) => {
      if (React.isValidElement(column)) {
        const { flexGrow, width = 0 } = column.props;
        totalFlexGrow += (flexGrow || 0);
        totalWidth += (flexGrow ? 0 : width);
      } else if (isArray(column)) {
        count(column);
      }
    });
  };
  count(columns);
  return {
    totalFlexGrow,
    totalWidth
  };
}

function cloneCell(Cell, props) {
  return React.cloneElement(Cell, props);
}

function colSpanCells(cells) {
  const nextCells = [];
  for (let i = 0; i < cells.length; i += 1) {
    let { width, colSpan } = cells[i].props;
    /**
     * 如果存在 colSpan 属性，就去找它的下一个 Cell,
     * 看看值是否是 isNullOrUndefined，，如果为空这可以合并这个单元格
     */

    if (colSpan) {
      let nextWidth = width;
      for (let j = 0; j < colSpan; j += 1) {
        let nextCell = cells[i + j];
        if (nextCell) {
          let { rowData, dataKey, children, width: colSpanWidth, isHeaderCell } = nextCell.props;
          if (
            (rowData && isNullOrUndefined(get(rowData, dataKey))) ||
            (isHeaderCell && isNullOrUndefined(children))
          ) {
            nextWidth += colSpanWidth;
            cells[i + j] = cloneCell(nextCell, {
              removed: true
            });
          }
        }
      }

      nextCells.push(cloneCell(cells[i], {
        width: nextWidth
      }));
      /* eslint-disable */
      continue;
    }
    nextCells.push(cells[i]);
  }
  return nextCells;
}

const propTypes = {
  width: PropTypes.number,
  /* eslint-disable */
  data: PropTypes.array,
  height: PropTypes.number,
  rowHeight: PropTypes.number,
  headerHeight: PropTypes.number,
  onRowClick: PropTypes.func,
  isTree: PropTypes.bool,
  expand: PropTypes.bool,
  /* eslint-disable */
  locale: PropTypes.object,
  sortColumn: PropTypes.string,
  sortType: PropTypes.oneOf(['desc', 'asc']),
  /**
   * @callback
   * @params: sortColumn dataKey
   * @params: sortType
   */
  onSortColumn: PropTypes.func,
  onRerenderRowHeight: PropTypes.func,
  onTreeToggle: PropTypes.func,
  renderTreeToggle: PropTypes.func,
  disabledScroll: PropTypes.bool,
  hover: PropTypes.bool,
  loading: PropTypes.bool,
  bordered: PropTypes.bool,
  wordWrap: PropTypes.bool,
  onScroll: PropTypes.func,

  onTouchStart: PropTypes.func, //for test
  onTouchMove: PropTypes.func, //for test
};

const defaultProps = {
  height: 200,
  rowHeight: 36,
  sortType: 'asc',
  hover: true,
  locale: {
    emptyMessage: 'No data found',
    loading: (
      <div>
        <i className="icon icon-cog icon-lg icon-spin" />
        <span>Loading...</span>
      </div>
    )
  }
};

class Table extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      width: props.width,
      columnWidth: 0,
      dataKey: 0,
      shouldFixedColumn: false,
      contentHeight: 0,
      contentWidth: 0,
      tableRowsMaxHeight: []
    };
    this.treeChildren = {};
    this.tableRows = [];
    this.mounted = false;
  }


  componentWillMount() {
    const { children = [] } = this.props;
    const shouldFixedColumn = Array.from(children).some(child => (
      child.props && child.props.fixed
    ));

    this.scrollY = 0;
    this.scrollX = 0;
    this.wheelHandler = new WheelHandler((deltaX, deltaY) => {
      this.handleWheel(deltaX, deltaY);
      this.scrollbarX.onWheelScroll(deltaX);
      this.scrollbarY.onWheelScroll(deltaY);
    },
      this.shouldHandleWheelX,
      this.shouldHandleWheelY
    );
    this.setState({ shouldFixedColumn });
    this.isMounted = true;
  }

  componentDidMount() {
    const { wordWrap } = this.props;
    this.reportTableWidth();
    this.reportTableContextHeight();
    this.calculateRowMaxHeight();
    onResize(this.table, debounce(this.reportTableWidth, 400))

  }
  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(this.props, nextProps) || !isEqual(this.state, nextState);
  }
  componentDidUpdate() {
    this.reportTableContextHeight();
    this.reportTableContentWidth();
    this.calculateRowMaxHeight();
    this.updatePosition();
  }

  componentWillUnmount() {
    this.isMounted = false;
  }
  onColumnResizeEnd = (columnWidth, cursorDelta, dataKey, index) => {
    this.setState({
      isColumnResizing: false,
      [`${dataKey}_${index}_width`]: columnWidth
    });
    addStyle(this.mouseArea, {
      display: 'none'
    });
  }

  onColumnResizeStart = (width, left, fixed) => {
    this.setState({
      isColumnResizing: true
    });
    const mouseAreaLeft = width + left;
    const x = fixed ? mouseAreaLeft : mouseAreaLeft + (this.scrollX || 0);
    const styles = { display: 'block' };
    translateDOMPositionXY(styles, x, 0);
    addStyle(this.mouseArea, styles);
  }

  onColumnResizeMove = (width, left, fixed) => {
    const mouseAreaLeft = width + left;
    const x = fixed ? mouseAreaLeft : mouseAreaLeft + (this.scrollX || 0);
    const styles = {};
    translateDOMPositionXY(styles, x, 0);
    addStyle(this.mouseArea, styles);
  }

  onTreeToggle = (rowKey, rowIndex, rowData) => {
    const { onTreeToggle } = this.props;
    const expandIcon = this.treeChildren[rowKey].ref;
    const isOpen = hasClass(expandIcon, 'open');

    if (isOpen) {
      removeClass(expandIcon, 'open');
    } else {
      addClass(expandIcon, 'open');
    }

    this.reportTableContextHeight();
    onTreeToggle && onTreeToggle(!isOpen, rowData);

  }

  /**
   * public api
   * @param {*} open
   */
  treeToggle(open, iteratee) {
    const buttons = this.treeChildren;
    const toggle = { addClass, removeClass };
    const key = open ? 'addClass' : 'removeClass';
    Object.values(buttons).forEach(item => {
      if (isUndefined(iteratee)) {
        toggle[key](item.ref, 'open');
      } else {
        if (iteratee(item.rowData)) {
          toggle[key](item.ref, 'open');
        }
      }
    });
    this.reportTableContextHeight();
  }

  treeToggleBy(open, iteratee) {
    this.treeToggle(open, iteratee);
  }

  getScrollCellGroups() {
    return this.table.querySelectorAll(`.${this.prefix('cell-group.scroll')}`);
  }

  getFixedCellGroups() {
    return this.table.querySelectorAll(`.${this.prefix('cell-group.fixed')}`);
  }

  getCells() {

    let left = 0;                  // Cell left margin
    const headerCells = [];          // Table header cell
    const bodyCells = [];            // Table body cell
    const columns = this.props.children;

    if (!columns) {
      return {
        headerCells,
        bodyCells,
        allColumnsWidth: left
      };
    }

    const { width: tableWidth } = this.state;
    const {
      sortColumn,
      sortType,
      onSortColumn,
      rowHeight,
      headerHeight
    } = this.props;

    const {
      totalFlexGrow,
      totalWidth
    } = getTotalByColumns(columns);

    ReactChildren.forEach(columns, (column, index) => {

      if (React.isValidElement(column)) {

        const columnChildren = column.props.children;
        const { width, resizable, flexGrow, minWidth } = column.props;

        if (resizable && flexGrow) {
          console.warn(`Cannot set 'resizable' and 'flexGrow' together in <Column>, column index: ${index}`);
        }

        if (columnChildren.length !== 2) {
          throw new Error(`Component <HeaderCell> and <Cell> is required, column index: ${index} `);
        }

        let nextWidth = this.state[`${columnChildren[1].props.dataKey}_${index}_width`] || width || 0;

        if (tableWidth && flexGrow && totalFlexGrow) {
          nextWidth = Math.max(
            ((tableWidth - totalWidth) / totalFlexGrow) * flexGrow,
            minWidth || 60
          );
        }

        let cellProps = {
          ...pick(column.props, Object.keys(Column.propTypes)),
          left,
          index,
          headerHeight,
          width: nextWidth,
          height: rowHeight,
          firstColumn: (index === 0),
          lastColumn: (index === columns.length - 1),
          key: index
        };

        let headerCellsProps = {
          ...pick(column.props, Object.keys(Column.propTypes)),
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
          merge(headerCellsProps, {
            onColumnResizeEnd: this.onColumnResizeEnd,
            onColumnResizeStart: this.onColumnResizeStart,
            onColumnResizeMove: this.onColumnResizeMove
          });
        }

        headerCells.push(cloneCell(columnChildren[0], {
          ...cellProps,
          ...headerCellsProps
        }));
        bodyCells.push(cloneCell(columnChildren[1], cellProps));

        left += nextWidth;
      }

    });


    return {
      headerCells,
      bodyCells,
      allColumnsWidth: left
    };
  }

  get isMounted() {
    return this.mounted;
  }
  set isMounted(isMounted) {
    this.mounted = isMounted;
  }

  handleScrollX = (delta) => {
    this.handleWheel(delta, 0);
  }
  handleScrollY = (delta) => {
    this.handleWheel(0, delta);
  }
  handleWheel = (deltaX, deltaY) => {

    const { onScroll } = this.props;
    if (!this.isMounted) {
      return;
    }
    const nextScrollX = this.scrollX - deltaX;
    const nextScrollY = this.scrollY - deltaY;

    this.scrollY = Math.min(0, nextScrollY < this.minScrollY ? this.minScrollY : nextScrollY);
    this.scrollX = Math.min(0, nextScrollX < this.minScrollX ? this.minScrollX : nextScrollX);
    this.updatePosition();

    onScroll && onScroll(this.scrollX, this.scrollY);
  }

  /**
   * 处理移动端 Touch 事件
   * Start 的时候初始化 x,y
   **/
  handleTouchStart = (event) => {
    const { onTouchStart } = this.props;
    const { pageX, pageY } = event.touches ? event.touches[0] : {};
    this.touchX = pageX;
    this.touchY = pageY;
    onTouchStart && onTouchStart(event)
  }

  /**
   * 处理移动端 Touch 事件
   * Move 的时候初始化，更新 scroll
   **/
  handleTouchMove = (event) => {
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

    onTouchMove && onTouchMove(event)
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
      translateDOMPositionXY(wheelStyle, this.scrollX, this.scrollY);
      translateDOMPositionXY(headerStyle, this.scrollX, 0);

      this.wheelWrapper && addStyle(this.wheelWrapper, wheelStyle);
      this.headerWrapper && addStyle(this.headerWrapper, headerStyle);
    }
    handleClass[this.scrollY < 0 ? 'add' : 'remove'](this.tableHeader, 'shadow');
  }
  updatePositionByFixedCell() {
    const wheelGroupStyle = {};
    const wheelStyle = {};
    const scrollGroups = this.getScrollCellGroups();
    const fixedGroups = this.getFixedCellGroups();

    translateDOMPositionXY(wheelGroupStyle, this.scrollX, 0);
    translateDOMPositionXY(wheelStyle, 0, this.scrollY);

    Array.from(scrollGroups).forEach((group) => {
      addStyle(group, wheelGroupStyle);
    });

    addStyle(this.wheelWrapper, wheelStyle);
    Array.from(fixedGroups).forEach((group) => {
      handleClass[this.scrollX < 0 ? 'add' : 'remove'](group, 'shadow');
    });
  }
  shouldHandleWheelX = (delta) => {
    const { disabledScroll, loading } = this.props;
    if (delta === 0 || disabledScroll || loading) {
      return false;
    }

    if (this.state.contentWidth <= this.state.width) {
      return false;
    }

    return (delta >= 0 && this.scrollX > this.minScrollX) ||
      (delta < 0 && this.scrollX < 0);
  }
  shouldHandleWheelY = (delta) => {
    const { disabledScroll, loading } = this.props;
    if (delta === 0 || disabledScroll || loading) {
      return false;
    }
    return (delta >= 0 && this.scrollY > this.minScrollY) || (delta < 0 && this.scrollY < 0);
  }

  renderRowData(bodyCells, rowData, props) {

    const { onRowClick, renderTreeToggle, wordWrap } = this.props;
    const hasChildren = this.props.isTree && rowData.children && Array.isArray(rowData.children);
    const rowKey = `_${(Math.random() * 1E18).toString(36).slice(0, 5).toUpperCase()}_${props.index}`;

    const row = this.renderRow({
      rowRef: (ref) => {
        this.tableRows[props.index] = ref;
      },
      key: props.index,
      width: props.rowWidth,
      height: props.rowHeight,
      top: props.top,
      onClick: () => {
        onRowClick && onRowClick(rowData);
      }
    }, bodyCells.map(cell => React.cloneElement(cell, {
      hasChildren,
      layer: props.layer,
      height: props.rowHeight,
      rowIndex: props.index,
      renderTreeToggle,
      onTreeToggle: this.onTreeToggle,
      rowKey,
      rowData,
      wordWrap
    })));


    // insert children
    if (hasChildren) {
      props.layer += 1;

      const childrenClasses = classNames(this.prefix('row-children'), {
        open: this.props.expand
      });

      return (
        <div
          className={childrenClasses}
          key={props.index}
          data-layer={props.layer}
          ref={(ref) => {
            if (ref) {
              this.treeChildren[rowKey] = { ref, rowData };
            }
          }}
        >
          {row}
          <div className="children" >
            {
              rowData.children.map((child, index) => (
                this.renderRowData(bodyCells, child, {
                  ...props,
                  index
                })
              ))
            }
          </div>
        </div>
      );
    }

    return row;
  }

  calculateRowMaxHeight() {
    const { wordWrap } = this.props
    if (wordWrap) {
      const tableRowsMaxHeight = [];
      this.tableRows.forEach((row, index) => {
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

  reportTableWidth = () => {
    const table = this.table;
    if (table) {
      this.scrollX = 0;
      this.scrollbarX && this.scrollbarX.resetScrollBarPosition();
      this.setState({
        width: getWidth(table)
      });
    }

  }

  reportTableContentWidth() {

    const table = this.table;
    const row = table.querySelectorAll(`.${this.prefix('row-header')}`)[0];
    const contentWidth = getWidth(row);

    this.setState({ contentWidth });
    // 这里 -10 是为了让滚动条不挡住内容部分
    this.minScrollX = -(contentWidth - this.state.width) - 10;
    if (this.state.contentWidth !== contentWidth) {
      this.scrollX = 0;
      this.scrollbarX && this.scrollbarX.resetScrollBarPosition();
    }
  }

  reportTableContextHeight() {
    const table = this.table;
    const rows = table.querySelectorAll(`.${this.prefix('row')}`);
    const { height, rowHeight, headerHeight } = this.props;
    let contentHeight = 0;
    Array.from(rows).forEach((row) => {
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

  renderRow(props, cells) {

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
        ref={(ref) => {
          this.mouseArea = ref;
        }}
        className={this.prefix('mouse-area')}
        style={styles}
      />
    );
  }

  getTableHeaderRef = (ref) => {
    this.tableHeader = ref;
  }

  renderTableHeader(headerCells, rowWidth) {
    const { rowHeight, headerHeight } = this.props;
    const row = this.renderRow({
      rowRef: this.getTableHeaderRef,
      width: rowWidth,
      height: rowHeight,
      headerHeight,
      isHeaderRow: true,
      top: 0
    }, headerCells);

    return (
      <div
        ref={(ref) => {
          this.headerWrapper = ref;
        }}
        className={this.prefix('header-row-wrapper')}
      >
        {row}
      </div>
    );
  }
  renderTableBody(bodyCells, rowWidth) {

    const {
      headerHeight,
      rowHeight,
      height,
      data,
      isTree,
      onRerenderRowHeight
    } = this.props;

    const { tableRowsMaxHeight } = this.state;



    const bodyStyles = {
      top: isTree ? 0 : headerHeight || rowHeight,
      height: height - (headerHeight || rowHeight)
    };

    let top = 0;    // Row position
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
        ref={(ref) => {
          this.tableBody = ref;
        }}
        className={this.prefix('body-row-wrapper')}
        style={bodyStyles}
        onTouchStart={this.handleTouchStart}
        onTouchMove={this.handleTouchMove}
        onWheel={this.wheelHandler.onWheel}
      >
        <div
          style={wheelStyles}
          className={this.prefix('body-wheel-area')}
          ref={(ref) => {
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

  renderInfo(shouldShow) {

    if (!shouldShow) {
      return null;
    }

    const { locale } = this.props;

    return (

      <div className={this.prefix('body-info')}>
        {locale.emptyMessage}
      </div>

    );
  }

  renderScrollbar() {
    const {
      disabledScroll,
      headerHeight,
      rowHeight,
      height,
      loading
    } = this.props;

    const {
      contentWidth,
      contentHeight
    } = this.state;

    if (disabledScroll || loading) {
      return null;
    }

    return (
      <div>
        <Scrollbar
          length={this.state.width}
          onScroll={this.handleScrollX}
          scrollLength={contentWidth}
          ref={(ref) => {
            this.scrollbarX = ref;
          }}
        />
        <Scrollbar
          vertical
          length={height - (headerHeight || rowHeight)}
          scrollLength={contentHeight}
          onScroll={this.handleScrollY}
          ref={(ref) => {
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
      <div className={this.prefix('loading-wrapper')}>
        <div className={this.prefix('loading')}>
          {locale.loading}
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
      ...props
    } = this.props;

    const { headerCells, bodyCells, allColumnsWidth } = this.getCells();
    const rowWidth = allColumnsWidth > width ? allColumnsWidth : width;
    const clesses = classNames(globalClassName, {
      [this.prefix('word-wrap')]: wordWrap,
      [this.prefix('treetable')]: isTree,
      [this.prefix('bordered')]: bordered,
      'column-resizing': this.state.isColumnResizing,
      'table-hover': hover
    }, className);

    const styles = {
      width: width || 'auto',
      height,
      ...style
    };

    const elementProps = omit(props, Object.keys(propTypes));

    return (
      <div
        {...elementProps}
        className={clesses}
        style={styles}
        ref={(ref) => {
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

Table.propTypes = propTypes;
Table.defaultProps = defaultProps;

export default decorate()(Table);
