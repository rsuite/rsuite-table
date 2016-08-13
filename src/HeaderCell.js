import React, {PropTypes} from 'react';
import Cell from './Cell';
import ClassNameMixin from './mixins/ClassNameMixin';
import ColumnResizeHandle from './ColumnResizeHandle';
import isIE8 from './utils/isIE8';


const HeaderCell = React.createClass({
    mixins: [ClassNameMixin],
    propTypes: {
        sortable: PropTypes.bool,
        resizable: PropTypes.bool,
        onColumnResizeEnd: PropTypes.func,
        onColumnResize: PropTypes.func,
        onColumnResizeMove: PropTypes.func,
        onSortColumn: PropTypes.func,
        headerHeight: PropTypes.number
    },
    _onColumnResize(width, left, event) {
        this.setState({
            columnWidth: width,
            initialEvent: event
        });
        this.props.onColumnResize(width, left, event);
    },
    _onColumnResizeEnd(columnWidth, cursorDelta) {
        this.setState({
            columnWidth: columnWidth
        });

        this.props.onColumnResizeEnd(columnWidth, cursorDelta, this.props.dataKey, this.props.index);
    },
    getInitialState() {
        return {
            columnWidth: this.props.width
        };
    },
    renderResizeSpanner() {

        const {resizable, left, onColumnResizeMove, fixed} = this.props;
        const {columnWidth, initialEvent} = this.state;

        if (!resizable) {
            return null;
        }


        return (
            <ColumnResizeHandle
                columnWidth={columnWidth}
                columnLeft={left}
                columnFixed={fixed}
                initialEvent={initialEvent}
                onColumnResizeMove={onColumnResizeMove}
                onColumnResize={this._onColumnResize }
                onColumnResizeEnd={this._onColumnResizeEnd }
                />
        );

    },
    renderSortColumn() {
        const { left, headerHeight, sortable, sortColumn, sortType, dataKey } = this.props;
        const { columnWidth } = this.state;

        const styles = {
            left: columnWidth + left - 16,
            top: headerHeight / 2 - 8
        };

        if (sortable) {

            const icon = (<i className={sortColumn === dataKey ? `fa fa-sort-${sortType}` : 'fa fa-sort'}></i>);
            return (
                <div style={styles} className={this.prefix('sortable') }>
                    {icon}
                </div>
            );
        }

        return null;
    },
    handleClick() {
        const { sortable, dataKey, sortType, onSortColumn } = this.props;
        sortable && onSortColumn && onSortColumn(dataKey, sortType === 'asc' ? 'desc' : 'asc');
    },
    render() {

        const classes = this.prefix('cell-header');
        const {sortable} = this.props;

        return (
            <div className={ classes } >
                <Cell isHeaderCell={true} {...this.props} onClick={this.handleClick}></Cell>
                { this.renderSortColumn() }
                { !isIE8 && this.renderResizeSpanner() }
            </div>
        );
    }

});

export default HeaderCell;
