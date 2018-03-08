// @flow

import * as React from 'react';
import classNames from 'classnames';
import _ from 'lodash';

import Cell from './Cell';
import ColumnResizeHandler from './ColumnResizeHandler';
import { isNullOrUndefined, getUnhandledProps, defaultClassPrefix, prefix } from './utils';

type Props = {
  width?: number,
  dataKey?: string,
  left?: number,
  className?: string,
  classPrefix?: string,

  // self props
  index?: number,
  sortColumn?: string,
  sortType: 'desc' | 'asc',
  sortable?: boolean,
  resizable?: boolean,
  onColumnResizeStart?: (columnWidth?: number, left?: number, fixed?: boolean) => void,
  onColumnResizeEnd?: (
    columnWidth?: number,
    cursorDelta?: number,
    dataKey?: any,
    index?: number
  ) => void,
  onColumnResizeMove?: (columnWidth?: number, columnLeft?: number, columnFixed?: boolean) => void,
  onSortColumn?: Function,
  headerHeight?: number,
  flexGrow?: number,
  fixed?: boolean
};

type State = {
  initialEvent?: Object,
  columnWidth?: number
};

class HeaderCell extends React.Component<Props, State> {
  static defaultProps = {
    classPrefix: defaultClassPrefix('table-cell-header'),
    sortType: 'asc'
  };
  constructor(props: Props) {
    super(props);
    this.state = {
      columnWidth: isNullOrUndefined(props.flexGrow) ? props.width : 0
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.width !== nextProps.width || this.props.flexGrow !== nextProps.flexGrow) {
      this.setState({
        columnWidth: isNullOrUndefined(nextProps.flexGrow) ? nextProps.width : 0
      });
    }
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);
  }

  handleColumnResizeStart = (event: any) => {
    const { left, fixed, onColumnResizeStart } = this.props;

    this.setState({ initialEvent: event });
    onColumnResizeStart && onColumnResizeStart(this.state.columnWidth, left, fixed);
  };

  handleColumnResizeEnd = (columnWidth?: number, cursorDelta?: number) => {
    const { dataKey, index, onColumnResizeEnd } = this.props;
    this.setState({ columnWidth });
    onColumnResizeEnd && onColumnResizeEnd(columnWidth, cursorDelta, dataKey, index);
  };

  handleClick = () => {
    const { sortable, dataKey, sortType, onSortColumn } = this.props;
    sortable && onSortColumn && onSortColumn(dataKey, sortType === 'asc' ? 'desc' : 'asc');
  };

  addPrefix = (name: string) => prefix(this.props.classPrefix)(name);

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
        onColumnResizeStart={this.handleColumnResizeStart}
        onColumnResizeEnd={this.handleColumnResizeEnd}
      />
    );
  }

  renderSortColumn() {
    const { left = 0, width = 0, sortable, sortColumn, sortType, dataKey } = this.props;
    const { columnWidth = 0 } = this.state;
    const styles = {
      left: (columnWidth || width) + left - 16
    };

    if (sortable) {
      return (
        <div style={styles} className={this.addPrefix('sort-wrapper')}>
          <i
            className={classNames(this.addPrefix('icon-sort'), {
              [this.addPrefix(`icon-sort-${sortType}`)]: sortColumn === dataKey
            })}
          />
        </div>
      );
    }

    return null;
  }

  render() {
    const { className, width, dataKey, left, classPrefix, ...rest } = this.props;
    const classes = classNames(classPrefix, className);
    const unhandled = getUnhandledProps(HeaderCell, rest);

    return (
      <div className={classes}>
        <Cell
          {...unhandled}
          width={width}
          dataKey={dataKey}
          left={left}
          isHeaderCell={true}
          onClick={this.handleClick}
        />
        {this.renderSortColumn()}
        {this.renderResizeSpanner()}
      </div>
    );
  }
}

export default HeaderCell;
