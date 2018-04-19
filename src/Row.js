// @flow

import * as React from 'react';
import classNames from 'classnames';
import { translateDOMPositionXY } from 'dom-lib';
import { defaultClassPrefix, getUnhandledProps, prefix } from './utils';

type Props = {
  width?: number,
  height?: number,
  headerHeight?: number,
  top?: number,
  isHeaderRow?: boolean,
  rowRef?: React.ElementRef<*>,
  className?: string,
  classPrefix?: string,
  style?: Object
};

class Row extends React.Component<Props> {
  static defaultProps = {
    classPrefix: defaultClassPrefix('table-row'),
    height: 46,
    headerHeight: 40,
    isHeaderRow: false
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
    translateDOMPositionXY(styles, 0, top);

    const unhandled = getUnhandledProps(Row, rest);

    return <div {...unhandled} ref={rowRef} className={classes} style={styles} />;
  }
}

export default Row;
