import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { defaultClassPrefix, getUnhandledProps, prefix } from './utils';
import { CellGroupProps } from './CellGroup.d';
import TableContext from './TableContext';

class CellGroup extends React.PureComponent<CellGroupProps> {
  static propTypes = {
    fixed: PropTypes.oneOf(['left', 'right']),
    width: PropTypes.number,
    height: PropTypes.number,
    left: PropTypes.number,
    style: PropTypes.object,
    className: PropTypes.string,
    classPrefix: PropTypes.string
  };
  static defaultProps = {
    classPrefix: defaultClassPrefix('table-cell-group')
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
      children,
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
    const unhandledProps = getUnhandledProps(CellGroup, rest);

    return (
      <TableContext.Consumer>
        {({ translateDOMPositionXY }) => {
          translateDOMPositionXY?.(styles, left, 0);
          return (
            <div {...unhandledProps} className={classes} style={styles}>
              {children}
            </div>
          );
        }}
      </TableContext.Consumer>
    );
  }
}

export default CellGroup;
