import React from 'react';
import {Table, Column, Cell, HeaderCell } from '../../src';
import fakeData from '../data/users';

const ResizableColumnTable = React.createClass({
    getInitialState() {
        return {
            data: fakeData
        };
    },
    render() {
        const {data} = this.state;
        return (
            <div>
                <Table  height={400} data={data} >

                    <Column width={50}  align="center"  fixed>
                        <HeaderCell>Id</HeaderCell>
                        <Cell dataKey="id" />
                    </Column>

                    <Column width={100} fixed  resizable>
                        <HeaderCell>First Name</HeaderCell>
                        <Cell dataKey="firstName" />
                    </Column>

                    <Column width={100} resizable>
                        <HeaderCell>Last Name</HeaderCell>
                        <Cell dataKey="lastName" />
                    </Column>

                    <Column width={200} resizable>
                        <HeaderCell>City</HeaderCell>
                        <Cell dataKey="city" />
                    </Column>

                    <Column width={200} resizable>
                        <HeaderCell>Street</HeaderCell>
                        <Cell dataKey="street" />
                    </Column>


                    <Column width={200} resizable>
                        <HeaderCell>Company Name</HeaderCell>
                        <Cell dataKey="companyName" />
                    </Column>

                    <Column width={200} resizable>
                        <HeaderCell>Email</HeaderCell>
                        <Cell dataKey="email" />
                    </Column>

                </Table>
            </div>
        );
    }
});

export default ResizableColumnTable;
