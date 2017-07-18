import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import _ from 'lodash';
import isNullOrUndefined from './utils/isNullOrUndefined';
import { LAYER_WIDTH } from './constants';
import decorate from './utils/decorate';


const propTypes = {
  align: PropTypes.oneOf(['left', 'center', 'right']),
  className: PropTypes.string,
  dataKey: PropTypes.string,
  isHeaderCell: PropTypes.bool,

  width: PropTypes.number,
  height: PropTypes.number,
  left: PropTypes.number,
  headerHeight: PropTypes.number,

  rowKey: PropTypes.string,
  rowData: PropTypes.object,
  rowIndex: PropTypes.number,
  layer: PropTypes.number,  // for tree table

  style: PropTypes.object,
  firstColumn: PropTypes.bool,
  lastColumn: PropTypes.bool,
  hasChildren: PropTypes.bool,

  onTreeToggle: PropTypes.func,
  cellRenderer: PropTypes.func,
  sortable: PropTypes.bool
};


const defaultProps = {
  align: 'left',
  headerHeight: 36,
  height: 36,
  width: 0,
  layer: 0,
  left: 0
};

class Cell extends React.Component {

  renderExpandIcon() {
    const {
      hasChildren,
      firstColumn,
      onTreeToggle,
      rowKey,
      rowIndex,
      rowData
    } = this.props;

    /**
     * 如果用子节点，同时是第一列,则创建一个 icon 用于展开节点
     */
    return (hasChildren && firstColumn) ? (
      <i
        role="button"
        tabIndex={-1}
        className="expand-icon icon"
        onClick={(event) => {
          onTreeToggle && onTreeToggle(rowKey, rowIndex, rowData, event);
        }}
      />
    ) : null;
  }

  render() {

    let {
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
      sortable,
      children,
      rowData,
      dataKey,
      cellRenderer,
      ...props
    } = this.props;


    const classes = classNames(this.prefix('cell'), {
      sortable: sortable && isHeaderCell,
      first: firstColumn,
      last: lastColumn
    }, className);

    const layerWidth = layer * LAYER_WIDTH;
    const nextWidth = (!isHeaderCell && firstColumn) ? width - layerWidth : width;

    const styles = {
      width: nextWidth,
      height: isHeaderCell ? headerHeight : height,
      zIndex: layer,
      left: (!isHeaderCell && firstColumn) ? left + layerWidth : left,
      ...style
    };


    const contentStyles = {
      width: nextWidth,
      textAlign: align
    };

    if (sortable) {
      contentStyles.paddingRight = 28;
    }

    const contentChildren = isNullOrUndefined(children) && rowData ? rowData[dataKey] : children;
    const elementProps = _.omit(props, Object.keys(propTypes));

    return (
      <div
        {...elementProps}
        className={classes}
        style={styles}
      >
        <div className={this.prefix('cell-wrap1')}>
          <div className={this.prefix('cell-wrap2')}>
            <div className={this.prefix('cell-wrap3')}>
              <div
                className={this.prefix('cell-content')}
                style={contentStyles}
              >
                {this.renderExpandIcon()}
                {cellRenderer ? cellRenderer(contentChildren) : contentChildren}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Cell.propTypes = propTypes;
Cell.defaultProps = defaultProps;


export default decorate()(Cell);
