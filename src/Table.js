import React, {PropTypes} from 'react';
import {findDOMNode} from 'react-dom';
import classNames from 'classnames';
import { on, scrollLeft, scrollTop, addStyle, addClass, removeClass } from 'dom-lib';

import Row from './Row';
import CellGroup from './CellGroup';

import { addPrefix } from './utils/classNameUtils';

const ReactChildren = React.Children;

const Table = React.createClass({
    propTypes: {
        width: PropTypes.number.isRequired,
        height: PropTypes.number,
        data: PropTypes.array.isRequired,
        rowHeight: PropTypes.number,
        scrollLeft: PropTypes.number,
        scrollTop: PropTypes.number,
        onRowClick: PropTypes.func,
        classPrefix: PropTypes.string
    },
    getDefaultProps() {
        return {
            classPrefix: 'table',
            height: 200,
            rowHeight: 36
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
    /**
     * Get all cells
     */
    getCells() {

        let headerCells = [];      // 表头的单元格
        let bodyCells = [];            // 数据项的单元格
        let left = 0;              // 单元格的距左位置
        let isFixedColumn = false;    // 是否存在固定列

        function cloneCell(cell, props) {
            return React.cloneElement(cell, props, cell.props.children);
        }

        ReactChildren.map(this.props.children, (column, index) => {

            let columnChildren = column.props.children;
            let {width, fixed} = column.props;

            if (columnChildren.length !== 2 ||
                columnChildren[0].type.displayName !== 'HeaderCell' ||
                columnChildren[1].type.displayName !== 'Cell'
            ) {
                new Error('Component <HeaderCell> and <Cell> is required');
            }

            if (fixed) {
                isFixedColumn = true;
            }

            headerCells.push(
                cloneCell(columnChildren[0], { width, fixed, left, key: index })
            );

            bodyCells.push(
                cloneCell(columnChildren[1], { width, fixed, left, key: index })
            );

            left += column.props.width;
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
            classPrefix,
            className,
            width,
            height,
            style,
            rowHeight
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
            <div className={clesses} style={styles}>
                <div
                    className={addPrefix('header-row-wrapper', classPrefix) }>
                    {this.renderRow({
                        ref: 'tableHeader',
                        width: rowWidth,
                        height: rowHeight,
                        isHeaderRow: true,
                        top: 0
                    }, headerCells) }
                </div>
                <div ref="tableBody"
                    className={addPrefix('body-row-wrapper', classPrefix) }
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
