import React from 'react';
import PropTypes from 'prop-types';
import Cell from './Cell';
import ColumnResizeHandler from './ColumnResizeHandler';
import isNullOrUndefined from './utils/isNullOrUndefined';

const HeaderCell = React.createClass({

  propTypes: {
    sortable: PropTypes.bool,
    resizable: PropTypes.bool,
    onColumnResizeEnd: PropTypes.func,
    onColumnResizeStart: PropTypes.func,
    onColumnResizeMove: PropTypes.func,
    onSortColumn: PropTypes.func,
    headerHeight: PropTypes.number
  },
  onColumnResizeStart(event) {
    const { left, fixed, onColumnResizeStart } = this.props;
    this.setState({ initialEvent: event });
    onColumnResizeStart && onColumnResizeStart(this.state.columnWidth, left, fixed);
  },
  onColumnResizeEnd(columnWidth, cursorDelta) {
    const { dataKey, index, onColumnResizeEnd } = this.props;
    this.setState({ columnWidth });
    onColumnResizeEnd && onColumnResizeEnd(columnWidth, cursorDelta, dataKey, index);
  },
  getInitialState() {
    const { width, flexGrow } = this.props;
    return {
      columnWidth: isNullOrUndefined(flexGrow) ? width : 0
    };
  },
  renderResizeSpanner() {

    const { resizable, left, onColumnResizeMove, fixed, headerHeight } = this.props;
    const { columnWidth, initialEvent } = this.state;

    if (!resizable) {
      return null;
    }

    return (
      <ColumnResizeHandler
        columnWidth={columnWidth}
        columnLeft={left}
        columnFixed={fixed}
        height={headerHeight}
        initialEvent={initialEvent}
        onColumnResizeMove={onColumnResizeMove}
        onColumnResizeStart={this.onColumnResizeStart}
        onColumnResizeEnd={this.onColumnResizeEnd}
      />
    );
  },
  renderSortColumn() {
    const { left, headerHeight, sortable, sortColumn, sortType, dataKey, width } = this.props;
    const { columnWidth } = this.state;
    const styles = {
      left: ((columnWidth || width) + left) - 16,
      top: (headerHeight / 2) - 8
    };

    if (sortable) {
      return (
        <div
          style={styles}
          className={this.prefix('sortable')}
        >
          <i className={sortColumn === dataKey ? `icon icon-sort-${sortType}` : 'icon icon-sort'} />
        </div>
      );
    }

    return null;
  },
  handleClick() {
    const { sortable, dataKey, sortType, onSortColumn } = this.props;
    sortable && onSortColumn && onSortColumn(dataKey, sortType === 'asc' ? 'desc' : 'asc');
  },
  render() {

    const classes = this.prefix('cell-header');
    return (
      <div className={classes} >
        <Cell
          {...this.props}
          isHeaderCell={true}
          onClick={this.handleClick}
        />
        {this.renderSortColumn()}
        {this.renderResizeSpanner()}
      </div>
    );
  }

});

export default HeaderCell;
