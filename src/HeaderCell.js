import React, {PropTypes} from 'react';
import Cell from './Cell';
import ClassNameMixin from './mixins/ClassNameMixin';

import ColumnResizeHandle from './ColumnResizeHandle';


const HeaderCell = React.createClass({
    mixins: [ClassNameMixin],
    propTypes: {
        sort: PropTypes.bool,
        resizable: PropTypes.bool,
        onColumnResizeEnd: PropTypes.func
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


        this.props.onColumnResizeEnd(columnWidth, cursorDelta, this.props.dataKey);
    },
    getInitialState() {
        return {
            columnWidth: this.props.width
        };
    },
    renderResizeSpanner() {

        let {resizable, left} = this.props;
        let {columnWidth, initialEvent} = this.state;

        if (!resizable) {
            return null;
        }

        return (
            <ColumnResizeHandle
                columnWidth={columnWidth}
                columnLeft={left}
                initialEvent={initialEvent}
                onColumnResize={this._onColumnResize }
                onColumnResizeEnd={this._onColumnResizeEnd }
                />
        );

    },
    render() {

        let classes = this.prefix('cell-header');

        return (
            <div className={ classes }>
                <Cell isHeaderCell={true} {...this.props}></Cell>
                {this.renderResizeSpanner() }
            </div>
        );
    }

});

export default HeaderCell;
