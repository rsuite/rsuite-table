import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import omit from 'lodash/omit';
import isEqual from 'lodash/isEqual';
import { translateDOMPositionXY } from 'dom-lib';

import decorate from './utils/decorate';

const propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  headerHeight: PropTypes.number,
  top: PropTypes.number,
  isHeaderRow: PropTypes.bool,
  rowRef: PropTypes.func
};

const defaultProps = {
  height: 36,
  headerHeight: 36,
  isHeaderRow: false
};

class Row extends React.Component {

  shouldComponentUpdate(nextProps) {
    return !isEqual(this.props, nextProps);
  }
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
      ...props
    } = this.props;

    const classes = classNames(this.prefix('row'), {
      [this.prefix('row-header')]: isHeaderRow
    }, className);

    const styles = {
      minWidth: width,
      height: isHeaderRow ? headerHeight : height,
      ...style
    };
    translateDOMPositionXY(styles, 0, top);
    const elementProps = omit(props, Object.keys(propTypes));

    return (
      <div
        {...elementProps}
        ref={rowRef}
        className={classes}
        style={styles}
      />
    );
  }
}

Row.propTypes = propTypes;
Row.defaultProps = defaultProps;

export default decorate()(Row);
