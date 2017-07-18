import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import decorate from './utils/decorate';

const propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  headerHeight: PropTypes.number,
  top: PropTypes.number,
  style: PropTypes.object,
  isHeaderRow: PropTypes.bool
};

const defaultProps = {
  height: 36,
  headerHeight: 36,
  isHeaderRow: false
};

class Row extends React.Component {
  render() {

    const {
      className,
      width,
      height,
      top,
      style,
      isHeaderRow,
      headerHeight,
      ...props
    } = this.props;

    const classes = classNames(this.prefix('row'), {
      [this.prefix('row-header')]: isHeaderRow
    }, className);

    const styles = {
      minWidth: width,
      height: isHeaderRow ? headerHeight : height,
      transform: `translate3d(0px, ${top}px, 0px)`,
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

Row.propTypes = propTypes;
Row.defaultProps = defaultProps;

export default decorate()(Row);
