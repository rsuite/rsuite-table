// @flow

import * as React from 'react';
import classNames from 'classnames';
import _ from 'lodash';
import { LAYER_WIDTH } from './constants';
import { isNullOrUndefined, defaultClassPrefix, getUnhandledProps, prefix, isRTL } from './utils';

type Props = {
  align?: 'left' | 'center' | 'right',
  verticalAlign?: 'top' | 'middle' | 'bottom',
  className?: string,
  classPrefix?: string,
  dataKey?: string,
  isHeaderCell?: boolean,

  width: number,
  height?: number,
  left?: number,
  headerHeight?: number,

  style?: Object,
  firstColumn?: boolean,
  lastColumn?: boolean,
  hasChildren?: boolean,
  children?: React.Node | ((rowData?: Object) => React.Node),

  rowKey?: string | number,
  rowIndex?: number,
  rowData?: Object,
  depth: number,

  onTreeToggle?: (
    rowKey?: string | number,
    rowIndex?: number,
    rowData?: Object,
    event?: SyntheticEvent<*>
  ) => void,

  renderTreeToggle?: (expandButton: React.Node, rowData?: Object) => React.Node,
  renderCell?: (contentChildren: any) => React.Node,

  wordWrap?: boolean,
  removed?: boolean
};

class Cell extends React.PureComponent<Props> {
  static defaultProps = {
    classPrefix: defaultClassPrefix('table-cell'),
    headerHeight: 36,
    depth: 0,
    height: 36,
    width: 0,
    left: 0
  };

  addPrefix = (name: string) => prefix(this.props.classPrefix)(name);

  handleExpandClick = (event: SyntheticEvent<*>) => {
    const { onTreeToggle, rowKey, rowIndex, rowData } = this.props;
    onTreeToggle && onTreeToggle(rowKey, rowIndex, rowData, event);
  };
  renderExpandIcon() {
    const { hasChildren, firstColumn, rowData, renderTreeToggle } = this.props;
    const expandButton = <i className={this.addPrefix('expand-icon')} />;

    /**
     * 如果用子节点，同时是第一列,则创建一个 icon 用于展开节点
     */
    if (hasChildren && firstColumn) {
      return (
        <span
          role="button"
          tabIndex={-1}
          className={this.addPrefix('expand-wrapper')}
          onClick={this.handleExpandClick}
        >
          {renderTreeToggle ? renderTreeToggle(expandButton, rowData) : expandButton}
        </span>
      );
    }

    return null;
  }

  render() {
    const {
      width,
      left,
      height,
      style,
      className,
      firstColumn,
      lastColumn,
      isHeaderCell,
      headerHeight,
      align,
      children,
      rowData,
      rowIndex,
      dataKey,
      renderCell,
      removed,
      wordWrap,
      classPrefix,
      depth,
      verticalAlign,
      ...rest
    } = this.props;

    if (removed) {
      return null;
    }

    const classes = classNames(classPrefix, className, {
      [this.addPrefix('first')]: firstColumn,
      [this.addPrefix('last')]: lastColumn
    });

    const nextHeight = isHeaderCell ? headerHeight : height;
    const styles = {
      width,
      height: nextHeight,
      zIndex: depth,
      [isRTL() ? 'right' : 'left']: left
    };

    const contentStyles: Object = {
      width,
      height: nextHeight,
      textAlign: align,
      [isRTL() ? 'paddingRight' : 'paddingLeft']: firstColumn ? depth * LAYER_WIDTH + 10 : null,
      ...style
    };

    if (verticalAlign) {
      contentStyles.display = 'table-cell';
      contentStyles.verticalAlign = verticalAlign;
    }

    let contentChildren =
      isNullOrUndefined(children) && rowData ? _.get(rowData, dataKey) : children;

    if (typeof children === 'function') {
      contentChildren = children(rowData, rowIndex);
    }

    const unhandled = getUnhandledProps(Cell, rest, [
      'index',
      'fixed',
      'resizable',
      'flexGrow',
      'minWidth',
      'sortColumn',
      'sortType',
      'onSortColumn',
      'onColumnResizeEnd',
      'onColumnResizeStart',
      'onColumnResizeMove',
      'colSpan'
    ]);

    return (
      <div {...unhandled} className={classes} style={styles}>
        {wordWrap ? (
          <div className={this.addPrefix('content')} style={contentStyles}>
            <div className={this.addPrefix('wrap')}>
              {this.renderExpandIcon()}
              {renderCell ? renderCell(contentChildren) : contentChildren}
            </div>
          </div>
        ) : (
          <div className={this.addPrefix('content')} style={contentStyles}>
            {this.renderExpandIcon()}
            {renderCell ? renderCell(contentChildren) : contentChildren}
          </div>
        )}
      </div>
    );
  }
}

export default Cell;
