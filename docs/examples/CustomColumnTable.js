import React from 'react';
import {Table, Column, Cell, HeaderCell } from '../../src';
import fakeObjectDataListStore from '../fakeObjectDataListStore';


const DateCell = ({ rowData, dataKey, ...props }) => (
    <Cell {...props}>
        {rowData[dataKey].toLocaleString() }
    </Cell>
);

const ImageCell = ({ rowData, dataKey, ...props }) => (
    <Cell {...props}>
        <img src={rowData[dataKey]} width="50" />
    </Cell>
);

const EmailCell = ({ rowData, dataKey, ...props }) => (
    <Cell {...props}>
        <a href={'mailto:' + rowData[dataKey]}>{rowData[dataKey]}</a>
    </Cell>
);



const ActionCell = ({ rowData, dataKey, ...props }) => {
    function handleAction() {
        alert(`id:${rowData[dataKey]}`);
        console.log(rowData, dataKey);
    }
    return (
        <Cell {...props}>
            <a onClick={handleAction} href="javascript:;"> Edit </a>
            |
            <a onClick={handleAction} href="javascript:;"> Remove </a>
        </Cell>
    );
};

const CustomColumnTable = React.createClass({
    getInitialState() {
        return {
            data: fakeObjectDataListStore(30)
        };
    },
    render() {
        const {data} = this.state;
        return (
            <div>
                <Table  height={400} data={data} rowHeight={64} headerHeight={36}>
                    <Column width={64}  align="center" >
                        <HeaderCell>Icon</HeaderCell>
                        <ImageCell dataKey="avartar" />
                    </Column>
                     <Column width={160}   >
                        <HeaderCell>First Name</HeaderCell>
                        <Cell dataKey="firstName" />
                    </Column>

                    <Column width={160} >
                        <HeaderCell>Last Name</HeaderCell>
                        <Cell dataKey="lastName" />
                    </Column>

                    <Column width={300} >
                        <HeaderCell>Email</HeaderCell>
                        <EmailCell dataKey="email" />
                    </Column>

                    <Column width={200} >
                        <HeaderCell>Action</HeaderCell>
                        <DateCell dataKey="date" />
                    </Column>

                    <Column width={200} >
                        <HeaderCell>Action</HeaderCell>
                        <ActionCell dataKey="id" />
                    </Column>



                </Table>
            </div>
        );
    }
});

export default CustomColumnTable;
