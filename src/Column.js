import React from 'react';
import PropTypes from 'prop-types';

/* eslint-disable */
const propTypes = {
  align: PropTypes.oneOf(['left', 'center', 'right']),
  width: PropTypes.number,
  fixed: PropTypes.bool,
  resizable: PropTypes.bool,
  sortable: PropTypes.bool,
  flexGrow: PropTypes.number,
  minWidth: PropTypes.number,
  colSpan: PropTypes.number,
};


const defaultProps = {
  width: 100
};

class Column extends React.Component {
  render() {
    // 组件 <Column> 不需要渲染
    return null;
  }
}

Column.propTypes = propTypes;
Column.defaultProps = defaultProps;


export default Column;
