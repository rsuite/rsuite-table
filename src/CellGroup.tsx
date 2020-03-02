import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { defaultClassPrefix, getUnhandledProps, prefix, translateDOMPositionXY } from './utils';
import { CellGroupProps } from './CellGroup.d';

class CellGroup extends React.PureComponent<CellGroupProps> {
  static propTypes = {
    fixed: PropTypes.oneOf(['left', 'right']),
    width: PropTypes.number,
    height: PropTypes.number,
    left: PropTypes.number,
    style: PropTypes.object,
    className: PropTypes.string,
    classPrefix: PropTypes.string,
    updatePosition: PropTypes.func
  };
  static defaultProps = {
    classPrefix: defaultClassPrefix('table-cell-group'),
    updatePosition: translateDOMPositionXY
  };

  addPrefix = (name: string) => prefix(this.props.classPrefix)(name);

  render() {
    const {
      fixed,
      width,
      left,
      height,
      style,
      classPrefix,
      className,
      updatePosition,
      ...rest
    } = this.props;
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

    updatePosition(styles, left, 0);

    return <div {...unhandled} className={classes} style={styles} />;
  }
}

export default CellGroup;
