import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import omit from 'lodash/omit';
import isEqual from 'lodash/isEqual';

import { translateDOMPositionXY } from 'dom-lib';
import decorate from './utils/decorate';

const propTypes = {
  fixed: PropTypes.bool,
  width: PropTypes.number,
  height: PropTypes.number,
  left: PropTypes.number
};


class CellGroup extends React.Component {

  shouldComponentUpdate(nextProps) {
    return !isEqual(this.props, nextProps);
  }

  render() {

    const {
      fixed,
      width,
      left,
      height,
      style,
      className,
      ...props
    } = this.props;

    const classes = classNames(
      this.prefix('cell-group'),
      fixed ? 'fixed' : 'scroll',
      className
    );

    const styles = {
      width,
      height,
      ...style
    };

    translateDOMPositionXY(styles, left, 0);
    const elementProps = omit(props, Object.keys(propTypes));

    return (
      <div
        {...elementProps}
        className={classes}
        style={styles}
      />
    );
  }
}

CellGroup.propTypes = propTypes;

export default decorate()(CellGroup);
