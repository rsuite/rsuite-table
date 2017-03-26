# rsuite-table

`rsuite-table` 是一个 `React` 实现的 `<Table>`，主要特性有：

- 支持固定表头，固定列（固定在左侧）
- 支持自定义调整列宽
- 支持自定义单元格内容
- 支持显示树状表格
- 支持排序

## # 快速开始

安装：

```sh
npm install rsuite-table --save-dev
```

示例：

```js
import react from 'react';
import ReactDOM from 'react-dom';
import { Table, Column, HeaderCell, Cell } from 'rsuite-table';
import 'rsuite-table/lib/less/index.less';

const dataList = [
    {id:1, name:'a', email:'a@email.com',avartar:'...'},
    {id:2, name:'b', email:'b@email.com',avartar:'...'},
    {id:3, name:'c', email:'c@email.com',avartar:'...'}
];

const ImageCell = ({ rowData, dataKey, ...props }) => (
    <Cell {...props}>
        <img src={rowData[dataKey]} width="50" />
    </Cell>
);

ReactDOM.render(

    <Table data = {dataList}  >
        <Column  width = {100} sort fixed resizable>
            <HeaderCell>ID</HeaderCell>
            <Cell dataKey="id"></Cell>
        </Column>

        <Column  width = {100} sort resizable>
            <HeaderCell>Name</HeaderCell>
            <Cell dataKey="name"></Cell>
        </Column>

        <Column  width = {100} sort resizable>
            <HeaderCell>Email</HeaderCell>
            <Cell dataKey="email"></Cell>
        </Column>

        <Column  width = {100} resizable>
            <HeaderCell>Avartar</HeaderCell>
            <ImageCell dataKey="avartar"></ImageCell>
        </Column>

    </Table> ,

    document.getElementById('mount')
);
```
