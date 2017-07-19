import React, { PropTypes } from 'react';


const Column = React.createClass({
  propTypes: {
    align: PropTypes.oneOf(['left', 'center', 'right']),
    width: PropTypes.number,
    fixed: PropTypes.bool,
    resizable: PropTypes.bool,
    sortable: PropTypes.bool,
    flexGrow: PropTypes.number,
    minWidth: PropTypes.number
  },
  getDefaultProps() {
    return {
      width: 100
    };
  },
  render() {
    // 组件 <Column> 不需要渲染
    return null;
  }
});

export default Column;
