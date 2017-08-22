import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import _ from 'lodash';
import {
  on,
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
import Row from './Row';
import CellGroup from './CellGroup';
import Scrollbar from './Scrollbar';

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
      } else if (_.isArray(column)) {
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

const propTypes = {
  width: PropTypes.number,
  data: PropTypes.array,
  height: PropTypes.number,
  rowHeight: PropTypes.number,
  headerHeight: PropTypes.number,
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
  onTreeToggle: PropTypes.func,
  disabledScroll: PropTypes.bool,
  hover: PropTypes.bool,
  loading: PropTypes.bool,
  onScroll: PropTypes.func
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
      contentWidth: 0
    };
    this.treeChildren = {};
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
    this.onWindowResizeListener = on(window, 'resize', _.debounce(this.reportTableWidth, 400));
    this.reportTableWidth();
    this.reportTableContextHeight();
  }
  shouldComponentUpdate(nextProps, nextState) {
    return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);
  }
  componentDidUpdate() {
    this.reportTableContextHeight();
    this.reportTableContentWidth();
    this.updatePosition();
  }

  componentWillUnmount() {
    if (this.onWheelListener) {
      this.onWheelListener.off();
    }
    if (this.onWindowResizeListener) {
      this.onWindowResizeListener.off();
    }
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
    const expandIcon = this.treeChildren[rowKey][rowIndex];
    const isOpen = hasClass(expandIcon, 'open');

    if (isOpen) {
      removeClass(expandIcon, 'open');
    } else {
      addClass(expandIcon, 'open');
    }

    this.reportTableContextHeight();
    onTreeToggle && onTreeToggle(!isOpen, rowData);

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

        let columnChildren = column.props.children;
        let { width, fixed, align, sortable, resizable, flexGrow, minWidth } = column.props;

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
          fixed,
          left,
          align,
          resizable,
          sortable,
          index,
          headerHeight,
          width: nextWidth,
          height: rowHeight,
          firstColumn: (index === 0),
          lastColumn: (index === columns.length - 1),
          flexGrow,
          key: index
        };

        let headerCellsProps = {
          headerHeight: headerHeight || rowHeight,
          dataKey: columnChildren[1].props.dataKey,
          sortColumn,
          sortType,
          onSortColumn,
          flexGrow
        };

        if (resizable) {
          headerCellsProps.onColumnResizeEnd = this.onColumnResizeEnd;
          headerCellsProps.onColumnResizeStart = this.onColumnResizeStart;
          headerCellsProps.onColumnResizeMove = this.onColumnResizeMove;
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

  randerRowData(bodyCells, rowData, props) {

    const { onRowClick } = this.props;
    const hasChildren = this.props.isTree && rowData.children &&
      Array.isArray(rowData.children) &&
      rowData.children.length > 0;

    const rowKey = `_${(Math.random() * 1E18).toString(36).slice(0, 5).toUpperCase()}`;
    const row = this.renderRow({
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
      onTreeToggle: this.onTreeToggle,
      rowKey,
      rowData
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
            if (!this.treeChildren[rowKey]) {
              this.treeChildren[rowKey] = {};
            }
            this.treeChildren[rowKey][props.index] = ref;
          }}
        >
          {row}
          <div className="children" >
            {
              rowData.children.map((child, index) => (
                this.randerRowData(bodyCells, child, {
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

  reportTableWidth = () => {
    const table = this.table;
    if (table) {
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

      fixedCells.forEach((item) => {
        fixedCellGroupWidth += item.props.width;
      });

      return (
        <Row {...props}>
          <CellGroup
            fixed
            height={props.isHeaderRow ? props.headerHeight : props.height}
            width={fixedCellGroupWidth}
          >
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


  renderTableHeader(headerCells, rowWidth) {
    const { rowHeight, headerHeight } = this.props;
    const row = this.renderRow({
      rowRef: (ref) => {
        this.tableHeader = ref;
      },
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

    const bodyStyles = {
      top: isTree ? 0 : headerHeight || rowHeight,
      height: height - (headerHeight || rowHeight)
    };

    let top = 0;    // Row position
    let rows = null;
    if (data && data.length > 0) {
      rows = data.map((rowData, index) => {
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
      ...props
  } = this.props;

    const { headerCells, bodyCells, allColumnsWidth } = this.getCells();
    const rowWidth = allColumnsWidth > width ? allColumnsWidth : width;
    const clesses = classNames(globalClassName, {
      [this.prefix('treetable')]: isTree,
      'column-resizing': this.state.isColumnResizing,
      'table-hover': hover
    }, className);

    const styles = {
      width: width || 'auto',
      height,
      ...style
    };

    const elementProps = _.omit(props, Object.keys(propTypes));

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
