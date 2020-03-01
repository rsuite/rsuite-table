import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { defaultClassPrefix, getUnhandledProps, prefix, translateDOMPositionXY } from './utils';
import { RowProps } from './Row.d';

class Row extends React.PureComponent<RowProps> {
  static propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    headerHeight: PropTypes.number,
    top: PropTypes.number,
    isHeaderRow: PropTypes.bool,
    rowRef: PropTypes.func,
    className: PropTypes.string,
    classPrefix: PropTypes.string,
    style: PropTypes.object,
    updatePosition: PropTypes.func
  };
  static defaultProps = {
    classPrefix: defaultClassPrefix('table-row'),
    height: 46,
    headerHeight: 40,
    isHeaderRow: false,
    updatePosition: translateDOMPositionXY
  };
  render() {
    const {
      className,
      width,
      height,
      top,
      style,
      isHeaderRow,
      headerHeight,
      rowRef,
      classPrefix,
      updatePosition,
      ...rest
    } = this.props;

    const addPrefix = prefix(classPrefix);
    const classes = classNames(classPrefix, className, {
      [addPrefix('header')]: isHeaderRow
    });

    const styles = {
      minWidth: width,
      height: isHeaderRow ? headerHeight : height,
      ...style
    };

    updatePosition?.(styles, 0, top);

    const unhandled = getUnhandledProps(Row, rest);

    return <div {...unhandled} ref={rowRef} className={classes} style={styles} />;
  }
}

export default Row;
