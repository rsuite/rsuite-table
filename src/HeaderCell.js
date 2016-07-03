import React, {PropTypes} from 'react';
import Cell from './Cell';
import { addPrefix } from './utils/classNameUtils';


const HeaderCell = React.createClass({
    propTypes: {
        sort: PropTypes.bool,
        classPrefix: PropTypes.string
    },
    getDefaultProps() {
        return {
            classPrefix: 'table'
        };
    },
    render() {
        let classes = addPrefix('cell-header', this.props.classPrefix);

        return (
            <div className={ classes }>
                <Cell isHeaderCell={true} {...this.props}></Cell>
            </div>
        );
    }

});

export default HeaderCell;
