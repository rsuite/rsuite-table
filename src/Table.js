import React, {PropTypes} from 'react';
import {findDOMNode} from 'react-dom';
import classNames from 'classnames';
import { on, scrollLeft, scrollTop, addStyle, addClass, removeClass } from 'dom-lib';

import Row from './Row';
import CellGroup from './CellGroup';

import ClassNameMixin from './mixins/ClassNameMixin';

const ReactChildren = React.Children;

const Table = React.createClass({
    mixins: [ClassNameMixin],
    propTypes: {
        width: PropTypes.number.isRequired,
        data: PropTypes.array.isRequired,
        height: PropTypes.number,
        rowHeight: PropTypes.number,
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
        return document.querySelectorAll(`.${this.props.classPrefix}-cell-group.fixed`);
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
            handelClass[toggle](group, 'shadow');
        });

        addStyle(tableHeaderDom, { left: (-left) + 'px' });

        let toggle = top > 1 ? 'addClass' : 'removeClass';
        handelClass[toggle](tableHeaderDom, 'shadow');
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

        let headerCells = [];      // 表头的单元格
        let bodyCells = [];            // 数据项的单元格
        let left = 0;              // 单元格的距左位置
        let isFixedColumn = false;    // 是否存在固定列
        let columns = this.props.children;

        var {dataKey, columnWidth } = this.state;

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

            headerCells.push(this.cloneCell(columnChildren[0], Object.assign(cellProps, headerCellsProps)));
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
            /*

            let {scrollLeft} = this.state;

            let styles = {
                left: scrollLeft
            };
            let classes = classNames({
                shadow: (scrollLeft > 1)
            });
            */


            return (
                <Row {...props}>
                    <CellGroup
                        //style = {styles}
                        //className={classes}
                        fixed
                        height={this.props.rowHeight}
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
            data,
            className,
            width,
            height,
            style,
            rowHeight,
            classPrefix
        } = this.props;


        let {headerCells, bodyCells, allColumnsWidth, isFixedColumn} = this.getCells();
        let top = 0;
        let rowWidth = allColumnsWidth > width ? allColumnsWidth : width;

        this.isFixedColumn = isFixedColumn;

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

        const clesses = classNames(
            classPrefix,
            className, {
                'column-resizing': this.state.isColumnResizing
            }
        );

        const styles = Object.assign({ width, height }, style);


        return (
            <div className={clesses} style={styles} ref='table'>
                {this.renderTableHeader(headerCells, rowWidth) }
                {this.renderTableBody(rows) }
                {this.renderMouseArea() }
            </div>
        );
    },
    renderTableHeader(headerCells, rowWidth) {
        const {rowHeight} = this.props;
        /*
        let {scrollLeft, scrollTop} = this.state;


        let styles = {
            left: - scrollLeft
        };
        let classes = classNames({
            shadow: (scrollTop > 1)
        });
        */



        const row = this.renderRow({
            //style: styles,
            //className: classes,
            ref: 'tableHeader',
            width: rowWidth,
            height: rowHeight,
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
    renderTableBody(rows) {

        const {rowHeight, height } = this.props;
        const bodyStyles = {
            top: rowHeight,
            height: height - rowHeight
        };

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
