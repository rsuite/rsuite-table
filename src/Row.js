import React, { PropTypes } from 'react';
import classNames from 'classnames';
import ClassNameMixin from './mixins/ClassNameMixin';
import ReactComponentWithPureRenderMixin from './mixins/ReactComponentWithPureRenderMixin';

import { assign } from 'lodash';
const Row = React.createClass({
  mixins: [
    ClassNameMixin,
    ReactComponentWithPureRenderMixin
  ],
  PropTypes: {
    width: PropTypes.number,
    height: PropTypes.number,
    headerHeight: PropTypes.number,
    top: PropTypes.number,
    style: PropTypes.object,
    isHeaderRow: PropTypes.bool
  },
  getDefaultProps() {
    return {
      height: 36,
      headerHeight: 36,
      isHeaderRow: false
    };
  },
  render() {
    const {
      children,
      className,
      width,
      height,
      top,
      style,
      isHeaderRow,
      headerHeight,
      ...props
    } = this.props;

    let classes = classNames(
      this.prefix('row'),
      isHeaderRow ? this.prefix('row-header') : '',
      className
    );

    let styles = assign({
      minWidth: width,
      height: isHeaderRow ? headerHeight : height,
      transform: `translate3d(0px, ${top}px, 0px)`
      //top
    }, style);

    return (
      <div
        className={classes}
        style={styles}
        {...props}
      >
        {children}
      </div>
    );
  }

});

export default Row;
