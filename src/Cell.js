import React, {PropTypes} from 'react';
import classNames from 'classnames';
import { addPrefix } from './utils/classNameUtils';

const Cell = React.createClass({
    propTypes: {
        align: PropTypes.oneOf(['left', 'center', 'right']),
        className: PropTypes.string,
        isHeaderCell: PropTypes.bool,
        width: PropTypes.number,
        height: PropTypes.number,
        left: PropTypes.number,

        rowData: PropTypes.object,
        rowIndex: PropTypes.number,

        dataKey: PropTypes.string,
        cellData: PropTypes.any,
        cellRenderer: PropTypes.func,
        classPrefix: PropTypes.string,

        fixed: PropTypes.bool,

        style: PropTypes.object
    },
    getDefaultProps() {
        return {
            classPrefix: 'table',
            height: 36,
        };
    },
    renderCell(content) {

        let {width, left, height, classPrefix, style, className} = this.props;
        let classes = classNames(
            addPrefix('cell', classPrefix),
            className
        );

        content = (
            <div className={addPrefix('cell-content', classPrefix) }>
                {content}
            </div>
        );

        let styles = Object.assign({ width, left, height }, style);

        return (
            <div className={classes} style={styles}>
                <div className={addPrefix('cell-wrap1', classPrefix) }>
                    <div className={addPrefix('cell-wrap2', classPrefix) }>
                        <div className={addPrefix('cell-wrap3', classPrefix) }>
                            {content}
                        </div>
                    </div>
                </div>
            </div>
        );
    },
    render() {
        const {
            children,
            rowData,
            isHeaderCell,
            dataKey,
            fixed
        } = this.props;

        if (isHeaderCell) {
            return this.renderCell(children);
        }

        return this.renderCell(rowData[dataKey]);
    }

});

export default Cell;
