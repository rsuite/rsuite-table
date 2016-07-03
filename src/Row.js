import React, {PropTypes} from 'react';
import classNames from 'classnames';
import { addPrefix } from './utils/classNameUtils';


const Row = React.createClass({
    displayName: 'TableRow',
    PropTypes: {
        width: PropTypes.number,
        height: PropTypes.number,
        top: PropTypes.number,
        style: PropTypes.object,
        classPrefix: PropTypes.string,
        isHeaderRow: PropTypes.bool
    },
    getDefaultProps() {
        return {
            classPrefix: 'table',
            height: 36,
            isHeaderRow: false
        };
    },
    render() {
        const {
            children,
            className,
            classPrefix,
            width,
            height,
            top,
            style,
            isHeaderRow,
            ...props
        } = this.props;

        let classes = classNames(
            addPrefix('row', classPrefix),
            isHeaderRow ? addPrefix('row-header', classPrefix) : '',
            className);

        let styles = Object.assign({ width, top, height }, style);

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
