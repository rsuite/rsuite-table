import React, {PropTypes} from 'react';
import {findDOMNode} from 'react-dom';
import classNames from 'classnames';
import { on, scrollLeft, scrollTop, addStyle, addClass, removeClass } from 'dom-lib';
import { assign } from 'lodash';

import Row from './Row';
import CellGroup from './CellGroup';

import ClassNameMixin from './mixins/ClassNameMixin';
import isIE8 from './utils/isIE8';

const ReactChildren = React.Children;

const Table = React.createClass({
    mixins: [ClassNameMixin],
    propTypes: {
        width: PropTypes.number,
        data: PropTypes.array.isRequired,
        height: PropTypes.number,
        rowHeight: PropTypes.number,
        headerHeight: PropTypes.number,
        scrollLeft: PropTypes.number,
        scrollTop: PropTypes.number,
        onRowClick: PropTypes.func
    },
    getDefaultProps() {
        return {
            height: 200,
            rowHeight: 36
        };
    },
    getInitialState() {
        return {
            columnWidth: 0,
            mouseAreaLeft: -1,
            dataKey: 0,
            scrollLeft: 0,
            scrollTop: 0,
            resizeColumnFixed: false
        };
    },
    getFixedCellGroups() {
        return findDOMNode(this.refs.table).querySelectorAll(`.${this.props.classPrefix}-cell-group.fixed`);
    },
    handleBodyScroll() {

        let {tableBody, tableHeader} = this.refs;
        let tableHeaderDom = findDOMNode(tableHeader);
        let groups = this.getFixedCellGroups();
        let handelClass = { addClass, removeClass };

        let left = scrollLeft(tableBody);
        let top = scrollTop(tableBody);

        this.scrollLeft = left;

        Array.from(groups).map((group) => {
            addStyle(group, { left: left + 'px' });
            let toggle = left > 1 ? 'addClass' : 'removeClass';
            !isIE8 && handelClass[toggle](group, 'shadow');
        });

        addStyle(tableHeaderDom, { left: (-left) + 'px' });

        let toggle = top > 1 ? 'addClass' : 'removeClass';
        !isIE8 && handelClass[toggle](tableHeaderDom, 'shadow');
    },
    _onColumnResizeEnd(columnWidth, cursorDelta, dataKey) {
        this.setState({
            isColumnResizing: false,
            mouseAreaLeft: -1,
            [dataKey + 'Width']: columnWidth
        });
    },
    _onColumnResize(width, left, event) {
        this.setState({
            isColumnResizing: true
        });
    },
    _onColumnResizeMove(width, left, fixed) {

        this.setState({
            resizeColumnFixed: fixed,
            mouseAreaLeft: width + left
        });
    },
    cloneCell(Cell, props) {
        return React.cloneElement(Cell, props, Cell.props.children);
    },
    getCells() {

        let headerCells = [];          // Table header cell
        let bodyCells = [];            // Table body cell
        let left = 0;                  // Cell left margin
        let isFixedColumn = false;     // IF there are fixed columns
        let columns = this.props.children;
        let { dataKey, columnWidth } = this.state;

        ReactChildren.map(columns, (column, index) => {

            let columnChildren = column.props.children;
            let { width, fixed, align, sort, resizable} = column.props;

            if (columnChildren.length !== 2) {
                throw new Error(`Component <HeaderCell> and <Cell> is required, column index: ${index} `);
            }

            if (fixed) {
                isFixedColumn = true;
            }

            width = this.state[columnChildren[1].props.dataKey + 'Width'] || width;

            let cellProps = {
                width, fixed, left, align, resizable,
                height: this.props.rowHeight,
                headerHeight: this.props.headerHeight,
                firstColumn: (index === 0),
                lastColumn: (index === columns.length - 1),
                key: index
            };

            let headerCellsProps = {
                dataKey: columnChildren[1].props.dataKey
            };

            if (resizable) {
                headerCellsProps.onColumnResizeEnd = this._onColumnResizeEnd;
                headerCellsProps.onColumnResize = this._onColumnResize;
                headerCellsProps.onColumnResizeMove = this._onColumnResizeMove;
            }

            headerCells.push(this.cloneCell(columnChildren[0], assign(cellProps, headerCellsProps)));
            bodyCells.push(this.cloneCell(columnChildren[1], cellProps));

            left += width;
        });

        return {
            headerCells,
            bodyCells,
            isFixedColumn,
            allColumnsWidth: left
        };
    },
    renderRow(props, cells) {

        //IF there are fixed columns, add a fixed group
        if (this.isFixedColumn) {

            let fixedCells = cells.filter(function (cell) {
                return cell.props.fixed;
            });

            let otherCells = cells.filter(function (cell) {
                return !cell.props.fixed;
            });

            let fixedCellGroupWidth = 0;

            fixedCells.map((item) => {
                fixedCellGroupWidth += item.props.width;
            });

            return (
                <Row {...props}>
                    <CellGroup
                        fixed
                        height={props.isHeaderRow ? props.headerHeight : props.height}
                        width={fixedCellGroupWidth}>
                        {fixedCells}
                    </CellGroup>
                    <CellGroup>{otherCells}</CellGroup>
                </Row>
            );

        }

        return (
            <Row {...props}>
                {cells}
            </Row>
        );

    },
    render() {
        const {
            children,
            className,
            width = 0,
            height,
            style,
            rowHeight,
            classPrefix,
            id
        } = this.props;

        let {headerCells, bodyCells, allColumnsWidth, isFixedColumn} = this.getCells();
        let rowWidth = allColumnsWidth > width ? allColumnsWidth : width;

        //Check there are fixed columns
        this.isFixedColumn = isFixedColumn;

        const clesses = classNames(
            classPrefix,
            className, {
                'column-resizing': this.state.isColumnResizing
            }
        );

        const styles = assign({ width: width || 'auto', height }, style);

        return (
            <div className={clesses} style={styles} ref='table' id={id}>
                {this.renderTableHeader(headerCells, rowWidth) }
                {this.renderTableBody(bodyCells, rowWidth, allColumnsWidth) }
                {!isIE8 && this.renderMouseArea() }
            </div>
        );
    },
    renderTableHeader(headerCells, rowWidth) {
        const {rowHeight, headerHeight} = this.props;
        const row = this.renderRow({
            ref: 'tableHeader',
            width: rowWidth,
            height: rowHeight,
            headerHeight: headerHeight,
            isHeaderRow: true,
            top: 0
        }, headerCells);

        return (
            <div
                className={this.prefix('header-row-wrapper') }>
                {row}
            </div>
        );
    },
    renderTableBody(bodyCells, rowWidth, allColumnsWidth) {

        const {headerHeight, rowHeight, height, data} = this.props;

        const bodyStyles = {
            top: headerHeight || rowHeight,
            height: height - (headerHeight || rowHeight)
        };

        let top = 0;    //Row position
        let rows = data.map((rowData, index) => {

            let cells = bodyCells.map((cell, key) => {
                return React.cloneElement(cell, {
                    key: key,
                    rowData: rowData,
                    rowIndex: index,
                }, cell.props.children);
            });

            let row = this.renderRow({
                key: index,
                rowIndex: index,
                width: rowWidth,
                height: rowHeight,
                rowData,
                top
            }, cells);

            top += rowHeight;
            return row;
        });

        return (
            <div ref="tableBody"
                className={this.prefix('body-row-wrapper') }
                style={bodyStyles}>
                {rows}
            </div>
        );
    },
    renderMouseArea() {
        const { height } = this.props;
        const scrollLeft = this.scrollLeft || 0;
        const {mouseAreaLeft, resizeColumnFixed} = this.state;

        const styles = {
            height,
            left: (resizeColumnFixed ? mouseAreaLeft : mouseAreaLeft - scrollLeft)
        };

        return (
            <div ref="mouseArea" className={this.prefix('mouse-area') } style={styles}></div>
        );
    },
    componentDidMount() {
        this._onBodyScrollListener = on(this.refs.tableBody, 'scroll', this.handleBodyScroll);
    },
    componentWillUnmount() {
        if (this._onBodyScrollListener) {
            this._onBodyScrollListener.off();
        }
    }

});

export default Table;
