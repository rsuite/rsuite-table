import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ColumnResizeHandler from './ColumnResizeHandler';
import { isNullOrUndefined, getUnhandledProps, defaultClassPrefix, prefix } from './utils';
import Cell from './Cell';
import { HeaderCellProps } from './HeaderCell.d';

interface HeaderCelltate {
  columnWidth?: number;
  width?: number;
  flexGrow?: number;
}

class HeaderCell extends React.PureComponent<HeaderCellProps, HeaderCelltate> {
  static propTypes = {
    index: PropTypes.number,
    sortColumn: PropTypes.string,
    sortType: PropTypes.oneOf(['desc', 'asc']),
    sortable: PropTypes.bool,
    resizable: PropTypes.bool,
    onColumnResizeStart: PropTypes.func,
    onColumnResizeEnd: PropTypes.func,
    onResize: PropTypes.func,
    onColumnResizeMove: PropTypes.func,
    onSortColumn: PropTypes.func,
    flexGrow: PropTypes.number,
    fixed: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf(['left', 'right'])]),
    children: PropTypes.node
  };
  static defaultProps = {
    classPrefix: defaultClassPrefix('table-cell-header')
  };

  static getDerivedStateFromProps(nextProps: HeaderCellProps, prevState: HeaderCelltate) {
    if (nextProps.width !== prevState.width || nextProps.flexGrow !== prevState.flexGrow) {
      return {
        width: nextProps.width,
        flexGrow: nextProps.flexGrow,
        columnWidth: isNullOrUndefined(nextProps.flexGrow) ? nextProps.width : 0
      };
    }

    return null;
  }

  constructor(props: HeaderCellProps) {
    super(props);
    this.state = {
      width: props.width,
      flexGrow: props.flexGrow,
      columnWidth: isNullOrUndefined(props.flexGrow) ? props.width : 0
    };
  }

  handleColumnResizeStart = () => {
    const { left, fixed, onColumnResizeStart } = this.props;

    onColumnResizeStart?.(this.state.columnWidth, left, !!fixed);
  };

  handleColumnResizeEnd = (columnWidth?: number, cursorDelta?: number) => {
    const { dataKey, index, onColumnResizeEnd, onResize } = this.props;
    this.setState({ columnWidth });
    onColumnResizeEnd?.(columnWidth, cursorDelta, dataKey, index);
    onResize?.(columnWidth, dataKey);
  };

  handleClick = () => {
    if (this.props.sortable) {
      this.props.onSortColumn?.(this.props.dataKey);
    }
  };

  addPrefix = (name: string) => prefix(this.props.classPrefix)(name);

  renderResizeSpanner() {
    const { resizable, left, onColumnResizeMove, fixed, headerHeight } = this.props;
    const { columnWidth } = this.state;

    if (!resizable) {
      return null;
    }

    return (
      <ColumnResizeHandler
        defaultColumnWidth={columnWidth}
        key={columnWidth}
        columnLeft={left}
        columnFixed={fixed}
        height={headerHeight ? headerHeight - 1 : undefined}
        onColumnResizeMove={onColumnResizeMove}
        onColumnResizeStart={this.handleColumnResizeStart}
        onColumnResizeEnd={this.handleColumnResizeEnd}
      />
    );
  }

  renderSortColumn(): React.ReactNode {
    const { sortable, sortColumn, sortType = '', dataKey } = this.props;

    if (sortable) {
      const iconClasses = classNames(this.addPrefix('icon-sort'), {
        [this.addPrefix(`icon-sort-${sortType}`)]: sortColumn === dataKey
      });
      return (
        <span className={this.addPrefix('sort-wrapper')}>
          <i className={iconClasses} />
        </span>
      );
    }
    return null;
  }

  render() {
    const {
      className,
      width,
      dataKey,
      headerHeight,
      children,
      left,
      sortable,
      classPrefix,
      sortColumn,
      sortType,
      ...rest
    } = this.props;

    const classes = classNames(classPrefix, className, {
      [this.addPrefix('sortable')]: sortable
    });
    const unhandledProps = getUnhandledProps(HeaderCell, rest);

    let ariaSort;

    if (sortColumn === dataKey) {
      ariaSort = 'other';
      if (sortType === 'asc') {
        ariaSort = 'ascending';
      } else if (sortType === 'desc') {
        ariaSort = 'descending';
      }
    }

    return (
      <div className={classes}>
        <Cell
          aria-sort={ariaSort}
          {...unhandledProps}
          width={width}
          dataKey={dataKey}
          left={left}
          headerHeight={headerHeight}
          isHeaderCell={true}
          onClick={this.handleClick}
        >
          {children}
          {this.renderSortColumn()}
        </Cell>

        {this.renderResizeSpanner()}
      </div>
    );
  }
}

export default HeaderCell;
