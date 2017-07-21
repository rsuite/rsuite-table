import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import _ from 'lodash';
import decorate from './utils/decorate';

const propTypes = {
  fixed: PropTypes.bool,
  width: PropTypes.number,
  height: PropTypes.number,
  left: PropTypes.number
};


class CellGroup extends React.Component {

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
      transform: `translate3d(${left || 0}px, 0px, 0px)`,
      ...style
    };

    const elementProps = _.omit(props, Object.keys(propTypes));

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
