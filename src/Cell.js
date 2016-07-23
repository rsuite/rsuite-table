import React, {PropTypes} from 'react';
import classNames from 'classnames';
import ClassNameMixin from './mixins/ClassNameMixin';
import { assign } from 'lodash';

const Cell = React.createClass({
    mixins: [ClassNameMixin],
    propTypes: {
        dataKey: PropTypes.string,

        align: PropTypes.oneOf(['left', 'center', 'right']),
        className: PropTypes.string,
        isHeaderCell: PropTypes.bool,

        width: PropTypes.number,
        height: PropTypes.number,
        left: PropTypes.number,
        headerHeight: PropTypes.number,

        rowData: PropTypes.object,
        rowIndex: PropTypes.number,

        cellData: PropTypes.any,
        cellRenderer: PropTypes.func,

        fixed: PropTypes.bool,

        style: PropTypes.object,
        firstColumn: PropTypes.bool,
        lastColumn: PropTypes.bool
    },
    getDefaultProps() {
        return {
            align: 'left',
            headerHeight: 36,
            height: 36,
        };
    },
    renderCell(content) {

        let {
            width,
            left,
            height,
            style,
            className,
            firstColumn,
            lastColumn,
            isHeaderCell,
            headerHeight,
            align
        } = this.props;


        let classes = classNames(
            this.prefix('cell'),
            className, {
                'first': firstColumn,
                'last': lastColumn
            });

        let styles = assign({
            width, left,
            height: isHeaderCell ? headerHeight : height
        }, style);

        let contentStyles = {
            width: width - 16,
            textAlign: align
        };

        content = (
            <div className={this.prefix('cell-content') } style={ contentStyles }>
                {content}
            </div>
        );

        return (
            <div className={classes} style={styles}>
                <div className={this.prefix('cell-wrap1') }>
                    <div className={this.prefix('cell-wrap2') }>
                        <div className={this.prefix('cell-wrap3') }>
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

        return this.renderCell(children || rowData[dataKey]);
    }

});

export default Cell;
