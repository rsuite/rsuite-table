import React, {PropTypes} from 'react';
import classNames from 'classnames';
import ClassNameMixin from './mixins/ClassNameMixin';
import { assign } from 'lodash';

const Row = React.createClass({
    mixins:[ClassNameMixin],
    PropTypes: {
        width: PropTypes.number,
        height: PropTypes.number,
        top: PropTypes.number,
        style: PropTypes.object,
        isHeaderRow: PropTypes.bool
    },
    getDefaultProps() {
        return {
            height: 36,
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
            ...props
        } = this.props;

        let classes = classNames(
            this.prefix('row'),
            isHeaderRow ? this.prefix('row-header') : '',
            className);

        let styles = assign({ minWidth: width, top, height }, style);

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
