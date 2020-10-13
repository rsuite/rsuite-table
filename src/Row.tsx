import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { defaultClassPrefix, getUnhandledProps, prefix } from './utils';
import TableContext from './TableContext';
import { RowProps } from './Row.d';

class Row extends React.PureComponent<RowProps> {
  static propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    headerHeight: PropTypes.number,
    top: PropTypes.number,
    isHeaderRow: PropTypes.bool,
    rowRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    className: PropTypes.string,
    classPrefix: PropTypes.string,
    style: PropTypes.object
  };
  static defaultProps = {
    classPrefix: defaultClassPrefix('table-row'),
    height: 46,
    headerHeight: 40
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
      children,
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

    const unhandledProps = getUnhandledProps(Row, rest);

    return (
      <TableContext.Consumer>
        {({ translateDOMPositionXY }) => {
          translateDOMPositionXY?.(styles, 0, top);
          return (
            <div role="row" {...unhandledProps} ref={rowRef} className={classes} style={styles}>
              {children}
            </div>
          );
        }}
      </TableContext.Consumer>
    );
  }
}

export default Row;
