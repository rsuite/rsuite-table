import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { LAYER_WIDTH } from './constants';
import { isNullOrUndefined, defaultClassPrefix, getUnhandledProps, prefix } from './utils';
import TableContext from './TableContext';
import Column from './Column';
import { CellProps } from './Cell.d';

export const propTypes = {
  align: PropTypes.oneOf(['left', 'center', 'right']),
  verticalAlign: PropTypes.oneOf(['top', 'middle', 'bottom']),
  className: PropTypes.string,
  classPrefix: PropTypes.string,
  dataKey: PropTypes.string,
  isHeaderCell: PropTypes.bool,
  width: PropTypes.number,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
  left: PropTypes.number,
  headerHeight: PropTypes.number,
  style: PropTypes.object,
  firstColumn: PropTypes.bool,
  lastColumn: PropTypes.bool,
  hasChildren: PropTypes.bool,
  children: PropTypes.any,
  rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  rowIndex: PropTypes.number,
  rowData: PropTypes.object,
  depth: PropTypes.number,
  onTreeToggle: PropTypes.func,
  renderTreeToggle: PropTypes.func,
  renderCell: PropTypes.func,
  wordWrap: PropTypes.bool,
  removed: PropTypes.bool,
  treeCol: PropTypes.bool,
  expanded: PropTypes.bool,
  groupHeader: PropTypes.node,
  groupCount: PropTypes.number
};

class Cell extends React.PureComponent<CellProps> {
  static contextType = TableContext;
  static propTypes = propTypes;
  static defaultProps = {
    classPrefix: defaultClassPrefix('table-cell'),
    headerHeight: 36,
    depth: 0,
    height: 36,
    width: 0,
    left: 0
  };

  addPrefix = (name: string) => prefix(this.props.classPrefix)(name);
  isTreeCol() {
    const { treeCol, firstColumn } = this.props;
    const { hasCustomTreeCol, isTree } = this.context;

    if (treeCol) {
      return true;
    }

    if (!hasCustomTreeCol && firstColumn && isTree) {
      return true;
    }

    return false;
  }
  getHeight() {
    const { height, rowData } = this.props;
    return typeof height === 'function' ? height(rowData) : height;
  }

  handleExpandClick = (event: React.MouseEvent) => {
    const { rowKey, rowIndex, rowData } = this.props;
    this.props.onTreeToggle?.(rowKey, rowIndex, rowData, event);
  };
  renderTreeNodeExpandIcon() {
    const { rowData, renderTreeToggle, hasChildren, expanded } = this.props;
    const expandButton = <i className={this.addPrefix('expand-icon')} />;

    if (this.isTreeCol() && hasChildren) {
      return (
        <span
          role="button"
          tabIndex={-1}
          className={this.addPrefix('expand-wrapper')}
          onClick={this.handleExpandClick}
        >
          {renderTreeToggle ? renderTreeToggle(expandButton, rowData, expanded) : expandButton}
        </span>
      );
    }

    return null;
  }

  render() {
    const {
      width,
      left,
      style,
      className,
      firstColumn,
      lastColumn,
      isHeaderCell,
      headerHeight,
      align,
      children,
      rowData,
      dataKey,
      rowIndex,
      renderCell,
      removed,
      wordWrap,
      classPrefix,
      depth,
      verticalAlign,
      expanded,
      ...rest
    } = this.props;

    if (removed) {
      return null;
    }

    const classes = classNames(classPrefix, className, {
      [this.addPrefix('expanded')]: expanded && this.isTreeCol(),
      [this.addPrefix('first')]: firstColumn,
      [this.addPrefix('last')]: lastColumn
    });
    const { rtl } = this.context;

    const nextHeight = isHeaderCell ? headerHeight : this.getHeight();
    const styles = {
      width,
      height: nextHeight,
      zIndex: depth,
      [rtl ? 'right' : 'left']: left
    };

    const contentStyles: React.CSSProperties = {
      width,
      height: nextHeight,
      textAlign: align,
      [rtl ? 'paddingRight' : 'paddingLeft']: this.isTreeCol() ? depth * LAYER_WIDTH + 10 : null,
      ...style
    };

    if (verticalAlign) {
      contentStyles.display = 'table-cell';
      contentStyles.verticalAlign = verticalAlign;
    }

    let cellContent = isNullOrUndefined(children) && rowData ? rowData[dataKey] : children;

    if (typeof children === 'function') {
      const getChildren = children as Function;
      cellContent = getChildren(rowData, rowIndex);
    }

    const unhandledProps = getUnhandledProps(Cell, getUnhandledProps(Column, rest));
    const cell = renderCell ? renderCell(cellContent) : cellContent;
    const content = wordWrap ? (
      <div className={this.addPrefix('wrap')}>
        {this.renderTreeNodeExpandIcon()}
        {cell}
      </div>
    ) : (
      <React.Fragment>
        {this.renderTreeNodeExpandIcon()}
        {cell}
      </React.Fragment>
    );

    return (
      <div
        role={isHeaderCell ? 'columnheader' : 'gridcell'}
        {...unhandledProps}
        className={classes}
        style={styles}
      >
        <div className={this.addPrefix('content')} style={contentStyles}>
          {content}
        </div>
      </div>
    );
  }
}

export default Cell;
