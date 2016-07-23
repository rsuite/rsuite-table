import React, {PropTypes} from 'react';
import classNames from 'classnames';
import ClassNameMixin from './mixins/ClassNameMixin';
import { assign } from 'lodash';

const HeaderCell = React.createClass({
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
        let styles = assign({ width, left, height }, style);

        return (
            <div className={classes} style={styles}>
                {children}
            </div>
        );
    }

});

export default HeaderCell;
