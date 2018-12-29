# rsuite-table

A React table component,


[![npm][npm-badge]][npm]

[![Travis][build-badge]][build] [![Coverage Status][coverage-badge]][coverage]


## Features

- Support fixed header, fixed column.
- Support custom adjustment column width.
- Support for custom cell content.
- Support for displaying a tree form.
- Support for sorting.


## Install

```sh
npm i rsuite-table --save
```


### Usage

```js
import { Table, Column, HeaderCell, Cell } from 'rsuite-table';
import 'rsuite-table/lib/less/index.less'

const dataList = [
  { id: 1, name: 'a', email: 'a@email.com', avartar: '...' },
  { id: 2, name: 'b', email: 'b@email.com', avartar: '...' },
  { id: 3, name: 'c', email: 'c@email.com', avartar: '...' }
];

const ImageCell = ({ rowData, dataKey, ...props }) => (
  <Cell {...props}>
    <img src={rowData[dataKey]} width="50" />
  </Cell>
);

<Table data={dataList}>
  <Column width={100} sort fixed resizable>
    <HeaderCell>ID</HeaderCell>
    <Cell dataKey="id" />
  </Column>

  <Column width={100} sort resizable>
    <HeaderCell>Name</HeaderCell>
    <Cell dataKey="name" />
  </Column>

  <Column width={100} sort resizable>
    <HeaderCell>Email</HeaderCell>
    <Cell dataKey="email" />
  </Column>

  <Column width={100} resizable>
    <HeaderCell>Avartar</HeaderCell>
    <ImageCell dataKey="avartar" />
  </Column>
</Table>;
```


## API


### `<Table>`

| Property               | Type `(Default)`                        | Description                                                                                   |
| ---------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------- |
| autoHeight             | boolean                                 | Automatic height                                                                              |
| bordered               | boolean                                 | Show border                                                                                   |
| cellBordered           | boolean                                 | Show cell border                                                                              |
| data \*                | Array&lt;Object&gt;                     | Table data                                                                                    |
| defaultExpandAllRows   | boolean                                 | Expand all nodes By default                                                                   |
| defaultExpandedRowKeys | Array&lt;string&gt;                     | Specify the default expanded row by `rowkey`                                                  |
| defaultSortType        | enum: 'desc', 'asc'                     | Sort type                                                                                     |
| expandedRowKeys        | Array&lt;string&gt;                     | Specify the default expanded row by `rowkey` (Controlled)                                     |
| headerHeight           | number`(40)`                            | Table Header Height                                                                           |
| height                 | number`(200)`                           | Table height                                                                                  |
| isTree                 | boolean                                 | Show as Tree table                                                                            |
| loading                | boolean                                 | Show loading                                                                                  |
| minHeight              | number `(0)`                            | Minimum height                                                                                |
| onExpandChange         | (expanded:boolean,rowData:object)=>void | Tree table, the callback function in the expanded node                                        |
| onRowClick             | (rowData:object)=>void                  | Click the callback function after the row and return to `rowDate`                             |
| onScroll               | (scrollX:object, scrollY:object)=>void  | Callback function for scroll bar scrolling                                                    |
| onSortColumn           | (dataKey:string, sortType:string)=>void | Click the callback function of the sort sequence to return the value `sortColumn`, `sortType` |
| renderRowExpanded      | (rowDate?: Object) => React.Node        | Customize what you can do to expand a zone                                                    |
| renderTreeToggle       | (icon:node,rowData:object)=> node       | Tree table, the callback function in the expanded node                                        |
| rowClassName           | string , (rowData:object)=>string       | Add an optional extra class name to row                                                       |
| rowExpandedHeight      | number `(100)`                          | Set the height of an expandable area                                                          |
| rowHeight              | number`(46)`                            | Row height                                                                                    |
| rowKey                 | string `('key')`                        | Each row corresponds to the unique `key` in `data`                                            |
| setRowHeight           | (rowData:object)=> number               | Custom Settings Row Height                                                                    |
| showHeader             | boolean `(true)`                        | Display header                                                                                |
| sortColumn             | string                                  | Sort column name ˝                                                                            |
| sortType               | enum: 'desc', 'asc'                     | Sort type (Controlled)                                                                        |
| width                  | number                                  | Table width                                                                                   |


### `<Column>`

| Property  | Type `(Default)`                                 | Description                                                                                                 |
| --------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| align     | enum: 'left','center','right'                    | Alignment                                                                                                   |
| colSpan   | number                                           | Merges column cells to merge when the `dataKey` value for the merged column is `null` or `undefined`.       |
| fixed     | boolean, 'left', 'right'                         | Fixed column                                                                                                |
| flexGrow  | number                                           | Set the column width automatically adjusts, when set `flexGrow` cannot set `resizable` and `width` property |
| minWidth  | number`(200)`                                    | When you use `flexGrow`, you can set a minimum width by `minwidth`                                          |
| onResize  | (columnWidth?: number, dataKey?: string) => void | Callback after column width change                                                                          |
| resizable | boolean                                          | Customizable Resize Column width                                                                            |
| sortable  | boolean                                          | Sortable                                                                                                    |
| width     | number                                           | Column width                                                                                                |




> `sortable` is used to define whether the column is sortable, but depending on what `key` sort needs to set a `dataKey` in `Cell`.
> The sort here is the service-side sort, so you need to handle the logic in the ' Onsortcolumn ' callback function of `<Table>`, and the callback function returns `sortColumn`, `sortType` values.


### `<Cell>`

| Property | Type `(Default)` | Description                                  |
| -------- | ---------------- | -------------------------------------------- |
| dataKey  | string           | Data binding `key`, but also a sort of `key` |
| rowData  | object           | Row data                                     |
| rowIndex | number           | Row number                                   |


[npm-badge]: https://img.shields.io/npm/v/rsuite-table.svg?style=flat-square
[npm]: https://www.npmjs.com/package/rsuite-table
[build-badge]: https://img.shields.io/travis/rsuite/rsuite-table.svg?style=flat-square
[build]: https://travis-ci.org/rsuite/rsuite-table
[coverage-badge]: https://img.shields.io/coveralls/rsuite/rsuite-table.svg?style=flat-square
[coverage]: https://coveralls.io/github/rsuite/rsuite-table
