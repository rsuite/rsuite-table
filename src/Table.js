import React, { PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import classNames from 'classnames';
import { on, scrollLeft, scrollTop, addStyle, addClass, removeClass, toggleClass, getWidth } from 'dom-lib';
import { assign } from 'lodash';

import Row from './Row';
import CellGroup from './CellGroup';

import ClassNameMixin from './mixins/ClassNameMixin';
import isIE8 from './utils/isIE8';
import debounce from './utils/debounce';

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
  mixins: [ClassNameMixin],
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
      resizeColumnFixed: false
    };
  },
  getFixedCellGroups() {
    return findDOMNode(this.table).querySelectorAll(`.${this.props.classPrefix}-cell-group.fixed`);
  },
  handleBodyScroll(event) {

    let tableHeaderDom = findDOMNode(this.tableHeader);
    let groups = this.getFixedCellGroups();
    let handelClass = { addClass, removeClass };

    let left = scrollLeft(this.tableBody);
    let top = scrollTop(this.tableBody);


    this.scrollLeft = left;

    Array.from(groups).map((group) => {
      addStyle(group, {
        transform: `translate3d(${left || 0}px, 0px, 0px)`
      });
      let toggle = left > 1 ? 'addClass' : 'removeClass';
      !isIE8 && handelClass[toggle](group, 'shadow');
    });

    addStyle(tableHeaderDom, {
      transform: `translate3d(${-left || 0}px, 0px, 0px)`
    });

    let toggle = top > 1 ? 'addClass' : 'removeClass';
    !isIE8 && handelClass[toggle](tableHeaderDom, 'shadow');
  },
  _onColumnResizeEnd(columnWidth, cursorDelta, dataKey, index) {
    this.setState({
      isColumnResizing: false,
      mouseAreaLeft: -1,
      [`${dataKey}_${index}_width`]: columnWidth
    });
  },
  _onColumnResize(width, left, event) {
    this.setState({
      isColumnResizing: true
    });
  },
  _onColumnResizeMove(width, left, fixed) {

    this.setState({
      resizeColumnFixed: fixed,
      mouseAreaLeft: width + left
    });
  },
  _onTreeToggle(rowKey, index) {
    toggleClass(findDOMNode(this.refs[`children_${rowKey}_${index}`]), 'open');
  },
  cloneCell(Cell, props) {
    return React.cloneElement(Cell, props, Cell.props.children);
  },
  getCells() {

    let left = 0;                  // Cell left margin
    let isFixedColumn = false;     // IF there are fixed columns
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

      if (fixed) {
        isFixedColumn = true;
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
        headerCellsProps.onColumnResizeEnd = this._onColumnResizeEnd;
        headerCellsProps.onColumnResize = this._onColumnResize;
        headerCellsProps.onColumnResizeMove = this._onColumnResizeMove;
      }

      headerCells.push(this.cloneCell(columnChildren[0], assign(cellProps, headerCellsProps)));
      bodyCells.push(this.cloneCell(columnChildren[1], cellProps));

      left += nextWidth;
    });

    return {
      headerCells,
      bodyCells,
      isFixedColumn,
      allColumnsWidth: left
    };
  },
  renderRow(props, cells) {

    //IF there are fixed columns, add a fixed group
    if (this.isFixedColumn) {

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
        {cells}
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

    let { headerCells, bodyCells, allColumnsWidth, isFixedColumn } = this.getCells();
    let rowWidth = allColumnsWidth > width ? allColumnsWidth : width;

    //Check there are fixed columns
    this.isFixedColumn = isFixedColumn;

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
      onTreeToggle: this._onTreeToggle,
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

    return (
      <div ref={ref => this.tableBody = ref}
        className={this.prefix('body-row-wrapper')}
        style={bodyStyles}>
        {rows}
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
  getTableWidth() {
    this.setState({
      width: getWidth(findDOMNode(this.table))
    });
  },
  componentDidMount() {
    this._onBodyScrollListener = on(this.tableBody, 'scroll', this.handleBodyScroll);
    this._onWindowResizeListener = on(window, 'resize', debounce(this.getTableWidth));
    this.getTableWidth();
  },
  componentDidUpdate: function (nextProps) {
    this.handleBodyScroll();
  },
  componentWillUnmount() {
    if (this._onBodyScrollListener) {
      this._onBodyScrollListener.off();
    }
    if (this._onWindowResizeListener) {
      this._onWindowResizeListener.off();
    }
  }

});

export default Table;
