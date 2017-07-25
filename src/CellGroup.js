import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { translateDOMPositionXY } from 'dom-lib';
import ClassNameMixin from './mixins/ClassNameMixin';
import ReactComponentWithPureRenderMixin from './mixins/ReactComponentWithPureRenderMixin';

const CellGroup = React.createClass({
  mixins: [
    ClassNameMixin,
    ReactComponentWithPureRenderMixin
  ],
  propTypes: {
    fixed: PropTypes.bool,
    width: PropTypes.number,
    height: PropTypes.number,
    left: PropTypes.number,
    style: PropTypes.string
  },
  render() {

    let {
      children,
      fixed,
      width,
      left,
      height,
      style,
      className
    } = this.props;

    let classes = classNames(
      className,
      this.prefix('cell-group'),
      fixed ? 'fixed' : 'scroll'
    );



    const styles = {
      width,
      height,
      ...style
    };

    translateDOMPositionXY(styles, left, 0);

    return (
      <div className={classes} style={styles}>
        {children}
      </div>
    );
  }

});

export default CellGroup;
