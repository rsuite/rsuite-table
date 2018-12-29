// @flow

import * as React from 'react';
import classNames from 'classnames';
import { translateDOMPositionXY } from 'dom-lib';

import { defaultClassPrefix, getUnhandledProps, prefix } from './utils';

type Props = {
  fixed?: 'left' | 'right',
  width?: number,
  height?: number,
  left?: number,
  style?: Object,
  className?: string,
  classPrefix?: string
};

class CellGroup extends React.Component<Props> {
  static defaultProps = {
    classPrefix: defaultClassPrefix('table-cell-group')
  };

  addPrefix = (name: string) => prefix(this.props.classPrefix)(name);

  render() {
    const { fixed, width, left, height, style, classPrefix, className, ...rest } = this.props;
    const classes = classNames(classPrefix, className, {
      [this.addPrefix(`fixed-${fixed || ''}`)]: fixed,
      [this.addPrefix('scroll')]: !fixed
    });
    const styles = {
      width,
      height,
      ...style
    };
    const unhandled = getUnhandledProps(CellGroup, rest);

    translateDOMPositionXY(styles, left, 0);

    return <div {...unhandled} className={classes} style={styles} />;
  }
}

export default CellGroup;
