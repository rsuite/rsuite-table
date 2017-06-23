import React, { PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import classNames from 'classnames';
import { on, scrollLeft, scrollTop, addStyle, addClass, removeClass, toggleClass, getWidth, getHeight } from 'dom-lib';
import { assign } from 'lodash';

import Row from './Row';
import CellGroup from './CellGroup';

import ClassNameMixin from './mixins/ClassNameMixin';
import ReactComponentWithPureRenderMixin from './mixins/ReactComponentWithPureRenderMixin';
import isIE8 from './utils/isIE8';
import debounce from './utils/debounce';
import ReactWheelHandler from './dom/ReactWheelHandler';
import translateDOMPositionXY from './utils/translateDOMPositionXY';

const handelClass = { add: addClass, remove: removeClass };

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

const ReactChildren = React.Children;
const LAYER_WIDTH = 30;
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
      mouseAreaLeft: -1,
      dataKey: 0,
      scrollLeft: 0,
      scrollTop: 0,
      resizeColumnFixed: false,
      shouldFixedColumn: false,
      contentHeight: 0,
      contentWidth: 0,
      scrollX: 0,
      scrollY: 0,
      maxScrollX: 0,
      maxScrollY: 0
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
      mouseAreaLeft: -1,
      [`${dataKey}_${index}_width`]: columnWidth
    });
  },
  onColumnResize(width, left, event) {
    this.setState({
      isColumnResizing: true
    });
  },
  onColumnResizeMove(width, left, fixed) {

    this.setState({
      resizeColumnFixed: fixed,
      mouseAreaLeft: width + left
    });
  },
  onTreeToggle(rowKey, index) {
    toggleClass(findDOMNode(this.refs[`children_${rowKey}_${index}`]), 'open');
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
        nextWidth = (tableWidth - totalWidth - 10) / totalFlexGrow * flexGrow || 0;
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
        headerCellsProps.onColumnResize = this.onColumnResize;
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
        {!isIE8 && this.renderMouseArea()}
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

    }) : (

        <div className={this.prefix('body-info')}>
          {this.props.locale.emptyMessage}
        </div>
      );

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
      </div>
    );
  },
  renderMouseArea() {

    const { height } = this.props;
    const scrollLeft = this.scrollLeft || 0;
    const { mouseAreaLeft, resizeColumnFixed } = this.state;

    const styles = {
      height,
      left: (resizeColumnFixed ? mouseAreaLeft : mouseAreaLeft - scrollLeft)
    };

    return (
      <div ref="mouseArea" className={this.prefix('mouse-area')} style={styles}></div>
    );
  },

  scrollY: 0,
  scrollX: 0,
  onWheel(deltaX, deltaY) {

    if (!this.isMounted()) {
      return;
    }

    const { height } = this.props;
    const { width, contentWidth, contentHeight } = this.state;

    const nextScrollX = this.scrollX - deltaX;
    const nextScrollY = this.scrollY - deltaY;
    const maxScrollX = -(contentWidth - width);
    const maxScrollY = -(contentHeight - height);


    this.scrollY = Math.min(0, nextScrollY < maxScrollY ? maxScrollY : nextScrollY);
    this.scrollX = Math.min(0, nextScrollX < maxScrollX ? maxScrollX : nextScrollX);

    /**
     * 当存在锁定列情况处理
     */
    if (this.state.shouldFixedColumn) {
      this.handleWheelByFixedCell();
    } else {
      const wheelStyle = {};
      const headerStyle = {};
      translateDOMPositionXY(wheelStyle, this.scrollX, this.scrollY);
      translateDOMPositionXY(headerStyle, this.scrollX, 0);
      addStyle(this.wheelWrapper, wheelStyle);
      addStyle(this.headerWrapper, headerStyle);
    }
    handelClass[this.scrollY < 0 ? 'add' : 'remove'](findDOMNode(this.tableHeader), 'shadow');
  },

  handleWheelByFixedCell() {
    const wheelGroupStyle = { };
    const wheelStyle = { };
    const scrollGroups = this.getScrollCellGroups();
    const fixedGroups = this.getFixedCellGroups();

    translateDOMPositionXY(wheelGroupStyle, this.scrollX, 0);
    translateDOMPositionXY(wheelStyle, 0, this.scrollY);

    Array.from(scrollGroups).map((group) => {
      addStyle(group, wheelGroupStyle);
    });

    addStyle(this.wheelWrapper, wheelStyle);

    Array.from(fixedGroups).map((group) => {
      handelClass[this.scrollX < 0 ? 'add' : 'remove'](group, 'shadow');
    });
  },

  shouldHandleWheelX(delta) {
    if (delta === 0) {
      return false;
    }
    const { width, contentWidth } = this.state;
    return this.scrollX <= 0;
  },
  shouldHandleWheelY(delta) {
    if (delta === 0) {
      return false;
    }
    return this.scrollY <= 0;
  },
  componentWillMount() {
    const { children } = this.props;

    const shouldFixedColumn = children.some((child) => {
      return child.props.fixed;
    });
    this.wheelHandler = new ReactWheelHandler(
      this.onWheel,
      this.shouldHandleWheelX,
      this.shouldHandleWheelY
    );

    this.setState({
      shouldFixedColumn
    });
  },
  reportTableWidth() {
    this.setState({
      width: getWidth(findDOMNode(this.table))
    });
  },
  reportTableContentWidth() {
    const row = findDOMNode(this.table).querySelectorAll(`.${this.props.classPrefix}-row-header`)[0];
    this.setState({
      contentWidth: getWidth(row)
    });
  },
  reportTableContextHeight() {
    const rows = findDOMNode(this.table).querySelectorAll(`.${this.props.classPrefix}-row`);
    let contentHeight = 0;
    Array.from(rows).forEach(row => {
      contentHeight += getHeight(row);
    });
    this.setState({
      contentHeight
    });
  },
  componentDidMount() {
    this._onWindowResizeListener = on(window, 'resize', debounce(this.reportTableWidth, 400));
    this.reportTableWidth();
    this.reportTableContentWidth();
    this.reportTableContextHeight();
  },
  componentDidUpdate() {
    this.reportTableContextHeight();
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
