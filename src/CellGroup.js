import React, {PropTypes} from 'react';
import classNames from 'classnames';
import { addPrefix } from './utils/classNameUtils';


const HeaderCell = React.createClass({
    propTypes: {
        classPrefix: PropTypes.string,
        fixed: PropTypes.bool,
        width: PropTypes.number,
        height: PropTypes.number,
        left: PropTypes.number,
        style: PropTypes.string
    },
    getDefaultProps() {
        return {
            classPrefix: 'table'
        };
    },
    render() {
        let {
            classPrefix,
            children,
            fixed,
            width,
            left,
            height,
            style
        } = this.props;
        let classes = classNames(
            addPrefix('cell-group', classPrefix),
            fixed ? 'fixed' : ''
        );
        let styles = Object.assign({ width, left, height }, style);
        return (
            <div className={classes} style={styles}>
                {children}
            </div>
        );
    }

});

export default HeaderCell;
