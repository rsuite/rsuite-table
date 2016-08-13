import React, {PropTypes} from 'react';


const Column = React.createClass({
    propTypes: {
        align: PropTypes.oneOf(['left', 'center', 'right']),
        width: PropTypes.number.isRequired,
        fixed: PropTypes.bool,
        resizable: PropTypes.bool,
        sortable: PropTypes.bool
    },

    render() {
        //组件 <Column> 不需要渲染
        return null;
    }
});

export default Column;
