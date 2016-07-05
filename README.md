#rsuite-table

## Basic Example
```js
import react from 'react';
import ReactDom from 'react-dom';
import { Table, Column, HeaderCell, Cell } from 'rsuite-table';


const dataList = [
    {id:1, name:'a', email:'a@email.com',iconURL:'...'},
    {id:1, name:'b', email:'b@email.com',iconURL:'...'},
    {id:1, name:'c', email:'c@email.com',iconURL:'...'}
];


ReactDom.render(
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

    </Table>
);
```
