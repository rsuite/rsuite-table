#react-fixed-table

## Basic Example
```js
import react from 'react';
import ReactDom from 'react-dom';
import { Table, Column, HeaderCell, Cell } from 'rsuite-table';


const rows = [
    {id:1, name:'a', email:'a@email.com',iconURL:'...'},
    {id:1, name:'b', email:'b@email.com',iconURL:'...'},
    {id:1, name:'c', email:'c@email.com',iconURL:'...'}
];


ReactDom.render(
    <Table data = {rows}  fixedHeader = {true} >

        <Column  width = {100} sort = {true} fixed={true}>
            <HeaderCell>ID</HeaderCell>
            <Cell col="id"></Cell>
        </Column>

        <Column  width = {100} sort = {true}>
            <HeaderCell>Name</HeaderCell>
            <Cell col="name"></Cell>
        </Column>

        <Column  width = {100} sort = {true} >
            <HeaderCell>Icon</HeaderCell>
            <Cell>
                <img src="iconURL"  />
            </Cell>
        </Column>

    </Table>
);
```
