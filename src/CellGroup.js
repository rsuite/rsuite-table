import React, { PropTypes } from 'react';
import classNames from 'classnames';
import ClassNameMixin from './mixins/ClassNameMixin';
import { assign } from 'lodash';

const CellGroup = React.createClass({
    mixins: [ClassNameMixin],
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
            fixed ? 'fixed' : ''
        );

        let styles = assign({
            width,
            transform: `translate3d(${left || 0}px, 0px, 0px)`,
            height
        }, style);

        return (
            <div className={classes} style={styles}>
                {children}
            </div>
        );
    }

});

export default CellGroup;
