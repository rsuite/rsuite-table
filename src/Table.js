import React, { PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import classNames from 'classnames';
import {
  on,
  addStyle,
  addClass,
  removeClass,
  toggleClass,
  getWidth,
  getHeight,
  translateDOMPositionXY,
  WheelHandler
} from 'dom-lib';

import { assign } from 'lodash';
import Row from './Row';
import CellGroup from './CellGroup';

import ClassNameMixin from './mixins/ClassNameMixin';
import ReactComponentWithPureRenderMixin from './mixins/ReactComponentWithPureRenderMixin';
import debounce from './utils/debounce';
import Scrollbar from './Scrollbar';

const handleClass = { add: addClass, remove: removeClass };
const ReactChildren = React.Children;
const LAYER_WIDTH = 30;

function getTotalByColumns(columns) {
  let totalFlexGrow = 0;
  let totalWidth = 0;
  for (let i = 0; i < columns.length; ++i) {
    totalFlexGrow += columns[i].props.flexGrow || 0;
    totalWidth += columns[i].props.width || 0;
  }
  return {
    totalFlexGrow,
    totalWidth
  };
}

const Table = React.createClass({
  mixins: [
    ClassNameMixin,
    ReactComponentWithPureRenderMixin
  ],
  propTypes: {
    width: PropTypes.number,
    data: PropTypes.array,
    height: PropTypes.number,
    rowHeight: PropTypes.number,
    headerHeight: PropTypes.number,
    scrollLeft: PropTypes.number,
    scrollTop: PropTypes.number,
    onRowClick: PropTypes.func,
    isTree: PropTypes.bool,
    expand: PropTypes.bool,
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
  },
  getDefaultProps() {
    return {
      height: 200,
      rowHeight: 36,
      sortType: 'asc',
      locale: {
        emptyMessage: 'No data found'
      }
    };
  },
  getInitialState() {
    return {
      width: this.props.width,
      columnWidth: 0,
      dataKey: 0,
      scrollLeft: 0,
      scrollTop: 0,
      shouldFixedColumn: false,
      contentHeight: 0,
      contentWidth: 0
    };
  },
  getFixedCellGroups() {
    return findDOMNode(this.table).querySelectorAll(`.${this.props.classPrefix}-cell-group.fixed`);
  },
  getScrollCellGroups() {
    return findDOMNode(this.table).querySelectorAll(`.${this.props.classPrefix}-cell-group.scroll`);
  },
  onColumnResizeEnd(columnWidth, cursorDelta, dataKey, index) {
    this.setState({
      isColumnResizing: false,
      [`${dataKey}_${index}_width`]: columnWidth
    });
    addStyle(this.mouseArea, {
      display: 'none'
    });
  },
  onColumnResizeStart(width, left, fixed) {
    this.setState({
      isColumnResizing: true
    });
    const mouseAreaLeft = width + left;
    const x = fixed ? mouseAreaLeft : mouseAreaLeft + (this.scrollX || 0);
    addStyle(this.mouseArea, {
      display: 'block',
      transform: `translate3d(${x}px, 0px, 0px)`
    });
  },
  onColumnResizeMove(width, left, fixed) {
    const mouseAreaLeft = width + left;
    const x = fixed ? mouseAreaLeft : mouseAreaLeft + (this.scrollX || 0);
    addStyle(this.mouseArea, {
      transform: `translate3d(${x}px, 0px, 0px)`
    });
  },
  onTreeToggle(rowKey, index) {
    toggleClass(findDOMNode(this.refs[`children_${rowKey}_${index}`]), 'open');
    this.reportTableContextHeight();
  },
  cloneCell(Cell, props) {
    return React.cloneElement(Cell, props, Cell.props.children);
  },
  getCells() {

    let left = 0;                  // Cell left margin
    const headerCells = [];          // Table header cell
    const bodyCells = [];            // Table body cell
    const columns = this.props.children;
    const { dataKey, columnWidth, width: tableWidth } = this.state;

    const { sortColumn, sortType, onSortColumn, rowHeight, headerHeight } = this.props;
    const { totalFlexGrow, totalWidth } = getTotalByColumns(columns);


    ReactChildren.map(columns, (column, index) => {

      let columnChildren = column.props.children;
      let { width, fixed, align, sortable, resizable, flexGrow } = column.props;

      if (columnChildren.length !== 2) {
        throw new Error(`Component <HeaderCell> and <Cell> is required, column index: ${index} `);
      }

      let nextWidth = this.state[`${columnChildren[1].props.dataKey}_${index}_width`] || width || 0;

      if (tableWidth && flexGrow) {
        nextWidth = (tableWidth - totalWidth) / totalFlexGrow * flexGrow || 0;
      }

      let cellProps = {
        fixed,
        left,
        align,
        resizable,
        sortable,
        index,
        width: nextWidth,
        height: rowHeight,
        headerHeight: headerHeight,
        firstColumn: (index === 0),
        lastColumn: (index === columns.length - 1),
        key: index
      };

      let headerCellsProps = {
        headerHeight: headerHeight || rowHeight,
        dataKey: columnChildren[1].props.dataKey,
        sortColumn,
        sortType,
        onSortColumn
      };

      if (resizable) {
        headerCellsProps.onColumnResizeEnd = this.onColumnResizeEnd;
        headerCellsProps.onColumnResizeStart = this.onColumnResizeStart;
        headerCellsProps.onColumnResizeMove = this.onColumnResizeMove;
      }

      headerCells.push(this.cloneCell(columnChildren[0], assign(cellProps, headerCellsProps)));
      bodyCells.push(this.cloneCell(columnChildren[1], cellProps));

      left += nextWidth;

    });


    return {
      headerCells,
      bodyCells,
      allColumnsWidth: left
    };
  },
  renderRow(props, cells) {

    //IF there are fixed columns, add a fixed group
    if (this.state.shouldFixedColumn) {

      let fixedCells = cells.filter(function (cell) {
        return cell.props.fixed;
      });

      let otherCells = cells.filter(function (cell) {
        return !cell.props.fixed;
      });

      let fixedCellGroupWidth = 0;

      fixedCells.map((item) => {
        fixedCellGroupWidth += item.props.width;
      });

      return (
        <Row {...props}>
          <CellGroup
            fixed
            height={props.isHeaderRow ? props.headerHeight : props.height}
            width={fixedCellGroupWidth}>
            {fixedCells}
          </CellGroup>
          <CellGroup>{otherCells}</CellGroup>
        </Row>
      );

    }

    return (
      <Row {...props}>
        <CellGroup>{cells}</CellGroup>
      </Row>
    );

  },
  render() {
    const {
      children,
      className,
      width = 0,
      height,
      style,
      rowHeight,
      classPrefix,
      isTree,
      id
    } = this.props;

    let { headerCells, bodyCells, allColumnsWidth } = this.getCells();
    let rowWidth = allColumnsWidth > width ? allColumnsWidth : width;


    const clesses = classNames(
      classPrefix,
      isTree ? this.prefix('treetable') : '',
      className, {
        'column-resizing': this.state.isColumnResizing
      }
    );

    const styles = assign({ width: width || 'auto', height }, style);

    return (
      <div className={clesses} style={styles} ref={ref => this.table = ref} id={id}>
        {this.renderTableHeader(headerCells, rowWidth)}
        {this.renderTableBody(bodyCells, rowWidth, allColumnsWidth)}
        {this.renderMouseArea()}
      </div>
    );
  },
  renderTableHeader(headerCells, rowWidth) {
    const { rowHeight, headerHeight } = this.props;
    const row = this.renderRow({
      ref: ref => this.tableHeader = ref,
      width: rowWidth,
      height: rowHeight,
      headerHeight: headerHeight,
      isHeaderRow: true,
      top: 0
    }, headerCells);

    return (
      <div
        ref={ref => this.headerWrapper = ref}
        className={this.prefix('header-row-wrapper')}>
        {row}
      </div>
    );
  },
  randerRowData(bodyCells, rowData, props) {

    const { onRowClick } = this.props;
    const hasChildren = this.props.isTree && rowData.children && Array.isArray(rowData.children) && rowData.children.length > 0;
    const rowKey = '_' + (Math.random() * 1E18).toString(36).slice(0, 5).toUpperCase();

    const row = this.renderRow({
      key: props.index,
      rowIndex: props.index,
      width: props.rowWidth,
      height: props.rowHeight,
      top: props.top,
      //transform:`translate3d(0px, ${props.top}px, 0px)`,
      onClick: () => {
        onRowClick && onRowClick(rowData);
      },
      rowData
    }, bodyCells.map((cell, key) => React.cloneElement(cell, {
      key: key,
      layer: props.layer,
      hasChildren: hasChildren,
      height: props.rowHeight,
      rowIndex: props.index,
      onTreeToggle: this.onTreeToggle,
      rowKey,
      rowData
    }, cell.props.children)));


    //insert children
    if (hasChildren) {
      props.layer++;

      let childrenClasses = classNames(this.prefix('row-children'), {
        open: this.props.expand
      });

      let childrenStyles = {
        marginLeft: LAYER_WIDTH
      };
      return (
        <div className={childrenClasses}
          data-layer={props.layer}
          ref={`children_${rowKey}_${props.index}`}
          key={props.index} >
          {row}
          <div className="children" >
            {rowData.children.map((child, index) => this.randerRowData(bodyCells, child, Object.assign({}, props, { index })))}
          </div>
        </div>
      );
    }

    return row;
  },
  renderTableBody(bodyCells, rowWidth, allColumnsWidth) {

    const {
      headerHeight,
      rowHeight,
      height,
      data,
      isTree,
      onRerenderRowHeight,
    } = this.props;

    const bodyStyles = {
      top: isTree ? 0 : headerHeight || rowHeight,
      height: height - (headerHeight || rowHeight)
    };

    let top = 0;    //Row position
    let layer = 0;  //Tree layer
    let rows = (data && data.length > 0) ? data.map((rowData, index) => {

      let nextRowHeight = rowHeight;

      /**
       * 自定义行高
       */
      if (onRerenderRowHeight) {
        nextRowHeight = onRerenderRowHeight(rowData) || rowHeight;
      }

      let row = this.randerRowData(bodyCells, rowData, {
        index,
        top,
        rowWidth,
        layer,
        rowHeight: nextRowHeight
      });

      !isTree && (top += nextRowHeight);

      return row;

    }) : null;

    const wheelStyles = {
      position: 'absolute'
    };

    return (
      <div ref={ref => this.tableBody = ref}
        className={this.prefix('body-row-wrapper')}
        style={bodyStyles}
        onWheel={this.wheelHandler.onWheel}
      >
        <div style={wheelStyles} ref={ref => this.wheelWrapper = ref}>
          {rows}
        </div>

        {
          rows ? null : (
            <div className={this.prefix('body-info')}>
              {this.props.locale.emptyMessage}
            </div>
          )
        }

        <Scrollbar
          length={this.state.width}
          onScroll={this.handleScrollX}
          scrollLength={this.state.contentWidth}
          ref={ref => this.scrollbarX = ref}
        />
        <Scrollbar
          vertical
          length={height - (headerHeight || rowHeight)}
          scrollLength={this.state.contentHeight}
          onScroll={this.handleScrollY}
          ref={ref => this.scrollbarY = ref}
        />
      </div>
    );
  },
  renderMouseArea() {

    const { height } = this.props;
    const scrollLeft = this.scrollLeft || 0;

    const styles = { height };

    return (
      <div
        ref={ref => this.mouseArea = ref}
        className={this.prefix('mouse-area')}
        style={styles}
      />
    );
  },
  handleScrollX(delta, event) {
    this.handleWheel(delta, 0);
  },
  handleScrollY(delta, event) {
    this.handleWheel(0, delta);
  },
  handleWheel(deltaX, deltaY) {

    if (!this.isMounted()) {
      return;
    }
    const nextScrollX = this.scrollX - deltaX;
    const nextScrollY = this.scrollY - deltaY;

    this.scrollY = Math.min(0, nextScrollY < this.minScrollY ? this.minScrollY : nextScrollY);
    this.scrollX = Math.min(0, nextScrollX < this.minScrollX ? this.minScrollX : nextScrollX);
    this.updatePosition();
  },
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
      addStyle(this.wheelWrapper, wheelStyle);
      addStyle(this.headerWrapper, headerStyle);
    }
    handleClass[this.scrollY < 0 ? 'add' : 'remove'](findDOMNode(this.tableHeader), 'shadow');
  },
  updatePositionByFixedCell() {
    const wheelGroupStyle = {};
    const wheelStyle = {};
    const scrollGroups = this.getScrollCellGroups();
    const fixedGroups = this.getFixedCellGroups();

    translateDOMPositionXY(wheelGroupStyle, this.scrollX, 0);
    translateDOMPositionXY(wheelStyle, 0, this.scrollY);

    Array.from(scrollGroups).map((group) => {
      addStyle(group, wheelGroupStyle);
    });

    addStyle(this.wheelWrapper, wheelStyle);
    Array.from(fixedGroups).map((group) => {
      handleClass[this.scrollX < 0 ? 'add' : 'remove'](group, 'shadow');
    });
  },
  shouldHandleWheelX(delta) {
    if (delta === 0) {
      return false;
    }
    return (delta >= 0 && this.scrollX > this.minScrollX) ||
      (delta < 0 && this.scrollX < 0);
  },
  shouldHandleWheelY(delta) {
    if (delta === 0) {
      return false;
    }
    return (delta >= 0 && this.scrollY > this.minScrollY) ||
      (delta < 0 && this.scrollY < 0);
  },

  componentWillMount() {
    const { children } = this.props;
    const shouldFixedColumn = children.some((child) => {
      return child.props.fixed;
    });
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
  },
  reportTableWidth() {
    this.setState({
      width: getWidth(findDOMNode(this.table))
    });
  },
  reportTableContentWidth() {
    const row = findDOMNode(this.table).querySelectorAll(`.${this.props.classPrefix}-row-header`)[0];
    const contentWidth = getWidth(row);

    this.setState({ contentWidth });
    this.minScrollX = -(contentWidth - this.state.width);

    if (this.state.contentWidth !== contentWidth) {
      this.scrollX = 0;
      this.scrollbarX.resetScrollBarPosition();
    }

  },
  reportTableContextHeight() {
    const rows = findDOMNode(this.table).querySelectorAll(`.${this.props.classPrefix}-row`);
    const { height, rowHeight, headerHeight } = this.props;
    let contentHeight = 0;
    Array.from(rows).forEach((row, index) => {
      contentHeight += getHeight(row);
    });

    const nextContentHeight = contentHeight - (headerHeight || rowHeight);
    this.setState({
      contentHeight: nextContentHeight
    });

    this.minScrollY = -(contentHeight - height);
    if (this.state.contentHeight !== nextContentHeight) {
      this.scrollY = 0;
      this.scrollbarY.resetScrollBarPosition();
    }
  },
  componentDidMount() {
    this._onWindowResizeListener = on(window, 'resize', debounce(this.reportTableWidth, 400));
    this.reportTableWidth();
    this.reportTableContextHeight();

  },
  componentDidUpdate() {
    this.reportTableContextHeight();
    this.reportTableContentWidth();
    this.updatePosition();
  },
  componentWillUnmount() {
    if (this._onWheelListener) {
      this._onWheelListener.off();
    }
    if (this._onWindowResizeListener) {
      this._onWindowResizeListener.off();
    }
  }
});

export default Table;
