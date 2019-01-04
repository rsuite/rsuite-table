// @flow

import * as React from 'react';
import classNames from 'classnames';
import _ from 'lodash';
import { LAYER_WIDTH } from './constants';
import { isNullOrUndefined, defaultClassPrefix, getUnhandledProps, prefix } from './utils';

type Props = {
  align?: 'left' | 'center' | 'right',
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
  layer: number,

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

class Cell extends React.Component<Props> {
  static defaultProps = {
    classPrefix: defaultClassPrefix('table-cell'),
    align: 'left',
    headerHeight: 36,
    height: 36,
    width: 0,
    layer: 0,
    left: 0
  };

  addPrefix = (name: string) => prefix(this.props.classPrefix)(name);

  handleExpandClick = (event: SyntheticEvent<*>) => {
    const { onTreeToggle, rowKey, rowIndex, rowData } = this.props;
    onTreeToggle && onTreeToggle(rowKey, rowIndex, rowData, event);
  };
  renderExpandIcon() {
    const { hasChildren, firstColumn, rowData, renderTreeToggle } = this.props;
    const expandButton = (
      <i
        role="button"
        tabIndex={-1}
        className={this.addPrefix('expand-icon')}
        onClick={event => {
          event.stopPropagation();
          this.handleExpandClick(event);
        }}
      />
    );

    /**
     * 如果用子节点，同时是第一列,则创建一个 icon 用于展开节点
     */
    if (hasChildren && firstColumn) {
      return renderTreeToggle ? (
        <span
          role="button"
          tabIndex={-1}
          className={this.addPrefix('expand-wrapper')}
          onClick={this.handleExpandClick}
        >
          {renderTreeToggle(expandButton, rowData)}
        </span>
      ) : (
        expandButton
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
      layer,
      align,
      children,
      rowData,
      dataKey,
      renderCell,
      removed,
      wordWrap,
      classPrefix,
      ...rest
    } = this.props;

    if (removed) {
      return null;
    }

    const classes = classNames(classPrefix, className, {
      [this.addPrefix('first')]: firstColumn,
      [this.addPrefix('last')]: lastColumn
    });

    const layerWidth = layer * LAYER_WIDTH;
    const nextWidth = !isHeaderCell && firstColumn ? width - layerWidth : width;
    const nextHeight = isHeaderCell ? headerHeight : height;

    const styles = {
      width: nextWidth,
      height: nextHeight,
      zIndex: layer,
      left: !isHeaderCell && firstColumn ? left + layerWidth : left
    };

    const contentStyles: Object = {
      width: nextWidth,
      height: nextHeight,
      textAlign: align,
      ...style
    };

    let contentChildren =
      isNullOrUndefined(children) && rowData ? _.get(rowData, dataKey) : children;

    if (typeof children === 'function') {
      contentChildren = children(rowData);
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
