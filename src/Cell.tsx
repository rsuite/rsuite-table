import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { LAYER_WIDTH } from './constants';
import omit from 'lodash/omit';
import { isNullOrUndefined, defaultClassPrefix, getUnhandledProps, prefix, isRTL } from './utils';
import { CellProps } from './Cell.d';

export const propTypes = {
  align: PropTypes.oneOf(['left', 'center', 'right']),
  verticalAlign: PropTypes.oneOf(['top', 'middle', 'bottom']),
  className: PropTypes.string,
  classPrefix: PropTypes.string,
  dataKey: PropTypes.string,
  isHeaderCell: PropTypes.bool,
  width: PropTypes.number,
  height: PropTypes.number,
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
  removed: PropTypes.bool
};

class Cell extends React.PureComponent<CellProps> {
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

  handleExpandClick = (event: React.MouseEvent) => {
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
      dataKey,
      rowIndex,
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

    const contentStyles: React.CSSProperties = {
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

    let contentChildren = isNullOrUndefined(children) && rowData ? rowData[dataKey] : children;

    if (typeof children === 'function') {
      const getChildren = children as Function;
      contentChildren = getChildren(rowData, rowIndex);
    }

    const unhandled = getUnhandledProps(
      Cell,
      omit(rest, [
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
      ])
    );

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
