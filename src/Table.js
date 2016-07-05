import React, {PropTypes} from 'react';
import {findDOMNode} from 'react-dom';
import classNames from 'classnames';
import { on, scrollLeft, scrollTop, addStyle, addClass, removeClass } from 'dom-lib';

import Row from './Row';
import CellGroup from './CellGroup';

import { addPrefix } from './utils/classNameUtils';
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
            dataKey: 0
        };
    },
    getFixedCellGroups() {
        return document.querySelectorAll(`.${this.props.classPrefix}-cell-group.fixed`);
    },
    handleBodyScroll() {
        let {tableBody, tableHeader} = this.refs;
        let left = scrollLeft(tableBody);
        let top = scrollTop(tableBody);

        let tableHeaderDom = findDOMNode(tableHeader);
        let groups = this.getFixedCellGroups();
        let handelClass = { addClass, removeClass };

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
            [dataKey + 'Width']: columnWidth
        });
        removeClass(findDOMNode(this.refs.table), 'column-resizing');
    },
    _onColumnResize(width, left, event) {

        this.setState({
            isColumnResizing: true
        });
        console.log(width);

        addClass(findDOMNode(this.refs.table), 'column-resizing');

    },
    getCells() {

        let headerCells = [];      // 表头的单元格
        let bodyCells = [];            // 数据项的单元格
        let left = 0;              // 单元格的距左位置
        let isFixedColumn = false;    // 是否存在固定列
        let columns = this.props.children;

        function cloneCell(cell, props) {
            return React.cloneElement(cell, props, cell.props.children);
        }

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
                width: width,
                firstColumn: (index === 0),
                lastColumn: (index === columns.length - 1),
                key: index
            };

            if (resizable) {
                cellProps.onColumnResizeEnd = this._onColumnResizeEnd;
                cellProps.onColumnResize = this._onColumnResize;
            }

            headerCells.push(cloneCell(columnChildren[0], Object.assign(cellProps, { dataKey: columnChildren[1].props.dataKey })));
            bodyCells.push(cloneCell(columnChildren[1], cellProps));

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

            return (
                <Row {...props}>
                    <CellGroup
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

            let row = this.renderRow({
                key: index,
                rowIndex: index,
                width: rowWidth,
                height: rowHeight,
                rowData,
                top
            }, bodyCells.map((cell, key) => {
                return React.cloneElement(cell, {
                    key: key,
                    rowData: rowData,
                    rowIndex: index,
                }, cell.props.children);
            }));

            top += rowHeight;
            return row;
        });

        let clesses = classNames(
            classPrefix,
            className
        );

        let styles = Object.assign({ width, height }, style);
        let bodyStyles = {
            top: rowHeight,
            height: height - rowHeight
        };

        return (
            <div className={clesses} style={styles} ref='table'>
                <div
                    className={this.prefix('header-row-wrapper') }>
                    {this.renderRow({
                        ref: 'tableHeader',
                        width: rowWidth,
                        height: rowHeight,
                        isHeaderRow: true,
                        top: 0
                    }, headerCells) }
                </div>
                <div ref="tableBody"
                    className={this.prefix('body-row-wrapper') }
                    style={bodyStyles}>
                    {rows}
                </div>
            </div>
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
