import React from 'react';
import {Table, Column, Cell, HeaderCell } from '../../src';
import fakeObjectDataListStore from '../fakeObjectDataListStore';

const FixedColumnTable = React.createClass({
    getInitialState() {
        return {
            data: fakeObjectDataListStore(100)
        };
    },
    handleSortColumn(sortColumn, sortType) {
        this.setState({
            sortColumn, sortType
        });
    },
    render() {
        const {data} = this.state;
        return (
            <div>
                <Table
                    height={400}
                    data={data}
                    sortColumn={this.state.sortColumn}
                    sortType={this.state.sortType}
                    onSortColumn={this.handleSortColumn}
                    >

                    <Column width={50}  align="center"  fixed>
                        <HeaderCell>Id</HeaderCell>
                        <Cell dataKey="id" />
                    </Column>

                    <Column width={130} fixed  sortable>
                        <HeaderCell>First Name</HeaderCell>
                        <Cell dataKey="firstName" />
                    </Column>

                    <Column width={130} sortable>
                        <HeaderCell>Last Name</HeaderCell>
                        <Cell dataKey="lastName" />
                    </Column>

                    <Column width={200} sortable>
                        <HeaderCell>City</HeaderCell>
                        <Cell dataKey="city" />
                    </Column>

                    <Column width={200} >
                        <HeaderCell>Street</HeaderCell>
                        <Cell dataKey="street" />
                    </Column>


                    <Column width={200} >
                        <HeaderCell>Company Name</HeaderCell>
                        <Cell dataKey="companyName" />
                    </Column>

                    <Column width={200} >
                        <HeaderCell>Email</HeaderCell>
                        <Cell dataKey="email" />
                    </Column>

                    <Column width={200} >
                        <HeaderCell>Email</HeaderCell>
                        <Cell dataKey="email" />
                    </Column>

                    <Column width={200} >
                        <HeaderCell>Email</HeaderCell>
                        <Cell dataKey="email" />
                    </Column>

                    <Column width={200} >
                        <HeaderCell>Email</HeaderCell>
                        <Cell dataKey="email" />
                    </Column>

                </Table>
            </div>
        );
    }
});

export default FixedColumnTable;
