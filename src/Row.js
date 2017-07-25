import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { translateDOMPositionXY } from 'dom-lib';
import ClassNameMixin from './mixins/ClassNameMixin';
import ReactComponentWithPureRenderMixin from './mixins/ReactComponentWithPureRenderMixin';

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


    const styles = {
      minWidth: width,
      height: isHeaderRow ? headerHeight : height,
      ...style
    };
    translateDOMPositionXY(styles, 0, top);

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
