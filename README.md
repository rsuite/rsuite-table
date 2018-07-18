# rsuite-table

`rsuite-table` 是一个 `React` 实现的 `<Table>` 组件，主要特性有：

- 支持固定表头，固定列（固定在左侧）；
- 支持自定义调整列宽；
- 支持自定义单元格内容；
- 支持显示树状表格；
- 支持排序。

版本与状态

[![npm][npm-badge]][npm]

[![npm][npm-beta-badge]][npm-beta]

[![Travis][build-badge]][build] [![Coverage Status][coverage-badge]][coverage]

## 快速开始

### 安装

```sh
npm i rsuite-table --save
```

### 样式

在 `less` 文件中引入:

```css
@import '~rsuite-table/lib/less/index.less';
```

### 示例代码

```js
import { Table, Column, HeaderCell, Cell } from 'rsuite-table';

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

[npm-badge]: https://img.shields.io/npm/v/rsuite-table.svg?style=flat-square
[npm]: https://www.npmjs.com/package/rsuite-table
[npm-beta-badge]: https://img.shields.io/npm/v/rsuite-table/beta.svg?style=flat-square
[npm-beta]: https://www.npmjs.com/package/rsuite-table
[build-badge]: https://img.shields.io/travis/rsuite/rsuite-table.svg?style=flat-square
[build]: https://travis-ci.org/rsuite/rsuite-table
[coverage-badge]: https://img.shields.io/coveralls/rsuite/rsuite-table.svg?style=flat-square
[coverage]: https://coveralls.io/github/rsuite/rsuite-table
