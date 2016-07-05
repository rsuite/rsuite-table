import React, {PropTypes} from 'react';
import classNames from 'classnames';
import ClassNameMixin from './mixins/ClassNameMixin';

const HeaderCell = React.createClass({
    mixins:[ClassNameMixin],
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
            style
        } = this.props;

        let classes = classNames(
            this.prefix('cell-group'),
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
